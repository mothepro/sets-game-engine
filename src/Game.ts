import Market from './Market'
import Player from './Player'
import Card, { Set } from './Card'
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

    /** The inital timeout for all players. */
    timeout: number

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

        for (let i = 0; i < Card.COMBINATIONS * shoe; i++)
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

    get unplayedCards(): number {
        return this.cards.length
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
    }

    /** Whether a set of cards in the market is valid to take. */
    public checkSet(...indexs: Set.Indexs): boolean {
        return Card.isSet(...this.market.cards.filter(
            (_, index) => indexs.indexOf(index) !== -1) as Set.Cards)
    }

    /** Returns and removes some cards from the market. Updates market. */
    public removeSet(...indexs: Set.Indexs): Set.Cards {
        const ret = this.market.popSet(...indexs)
        this.fillMarket()
        return ret
    }

    /** Fill the market with cards. */
    private fillMarket(): void {
        while (this.cards.length && !this.market.isFull)
            this.market.pushCards(...this.cards.splice(0, 3) as Set.Cards)
        this.inProgress = !this.isDone
        this.emit(this.inProgress ? Events.marketFilled : Events.finish)
    }
}
