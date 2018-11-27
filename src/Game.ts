import Market from './Market'
import Player from './Player'
import Card, { CardSet, Details } from './Card'
import StrictEventEmitter from 'strict-event-emitter-types'
import { EventEmitter } from 'events'
import { shuffle } from './util'
import { EventMap, Events } from './events'

type Constructor<T> = { new(...args: any[]): T }

interface GameOptions {
    /** Size of the deck. */
    shoe: number

    /** A random number generator for generating the cards. */
    rng: (max: number) => number

    /**
     * Calculate the next time out for a player.
     * When the game starts this function is used to set the timeout for each player.
     * The `oldTimeout` parameter is set to 0 for this case.
     */
    nextTimeout: (oldTimeout: number, player: Player) => number
}

export default class Game
    extends (EventEmitter as Constructor<StrictEventEmitter<EventEmitter, EventMap>>) {

    private readonly players_: Set<Player> = new Set

    /** Playable cards. */
    protected readonly cards: Card[] = []

    /** The cards shown the players. */
    protected readonly market = new Market

    /** Whether the game is started and currently being played. */
    protected inProgress = false

    constructor({shoe = 1, rng, nextTimeout}: Partial<GameOptions> = {}) {
        super()

        for (let i = 0; i < Details.combinations * shoe; i++)
            this.cards.push(Card.make(i))
        shuffle(this.cards, rng)

        if (nextTimeout) {
            // reset timeouts
            this.on(Events.start, () => {
                for(const player of this.players_)
                    player.timeout = nextTimeout(0, player)
            })
            this.on(Events.playerBanned, ({player}) => player.timeout = nextTimeout(player.timeout, player))
        }
    }

    get isDeckEmpty(): boolean {
        return this.cards.length === 0
    }

    /** Whether any more sets can be made. */
    get isDone(): boolean {
        return this.isDeckEmpty && !this.market.isPlayable
    }

    get playableCards(): ReadonlyArray<Card> {
        return this.market.cards
    }

    get maxScore(): number {
        return this.players.reduce((maxScore, player) => Math.max(maxScore, player.score), 0)
    }

    get players(): Player[] {
        return [...this.players_]
    }

    /** Currently winning players. */
    get winners(): Player[] {
        return this.players.filter(player => player.score == this.maxScore)
    }

    public setCards(cards: Card[] | number[]) {
        if (this.inProgress)
            throw Error('Can not load cards into a game in progress')

        this.cards.length = 0
        for (let card of cards)
            this.cards.push(typeof card === 'number' ? Card.make(card) : card)
    }

    /** Adds a new player to the game before starting. */
    public addPlayer(player: Player): this {
        if (!this.inProgress && !this.players_.has(player)) {
            player.game = this
            this.players_.add(player)
            this.emit(Events.playerAdded, player)
        }
        return this
    }

    /** Ready up. */
    public start() {
        this.emit(Events.start)
        this.fillMarket()
        return this
    }

    /** Whether a set of cards in the market is valid to take. */
    public check(...cards: CardSet): boolean {
        this.market.assert(cards)
        return Card.isSet(...cards)
    }

    /** Returns and removes some cards from the market. Updates market. */
    public take(...cards: CardSet): CardSet {
        const ret = this.market.popSet(...cards)
        this.fillMarket()
        return ret
    }

    public hint(): CardSet {
        const cards = Card.getSet([...this.playableCards])
        if (cards)
            return cards
        throw Error('No hint can be given since a set can not be made.')
    }

    /** Fill the market with cards. */
    protected fillMarket(): void {
        while (this.cards.length && !this.market.isFull)
            this.market.pushCards(...this.cards.splice(0, 3) as CardSet)
        this.market.cleanUp()
        this.inProgress = !this.isDone
        this.emit(this.inProgress ? Events.marketFilled : Events.finish)
    }
}
