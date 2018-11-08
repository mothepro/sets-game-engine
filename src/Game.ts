import Market from './Market'
import Player from './Player'
import Card, {Set} from './Card'
import StrictEventEmitter from 'strict-event-emitter-types'
import { EventEmitter } from 'events'
import { shuffle } from './util'
import { EventMap, Events } from './events'

type Constructor<T> = { new(...args: any[]): T }

export interface State {
    readonly cards: ReadonlyArray<Card>,
    readonly market: Market,
    readonly players: ReadonlyArray<Player>,
}

interface Timeout {
    /** The inital timeout for all players. */
    readonly initial: number

    /** After a player is banned, their timeout will increase by this amount. */
    increase: number

    /** After a player is banned everyone's next timeout will increase by this amount. */
    readonly increaseIncreaser: number
}

interface GameOptions {
    /** Size of the deck. */
    shoe: number

    /** A random number generator for generating the cards. */
    rng: (max: number) => number

    /** Banning players after taking an invalid set. */
    timeout: Partial<Timeout>
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

    /** Numbers pertaining to blocking a player after taking an invalid set. */
    public readonly timeout: Timeout

    constructor({
      shoe = 1,
      rng,
      timeout: {
          initial           = 1000,
          increase          = 1000,
          increaseIncreaser = 0,
      } = {},
    }: Partial<GameOptions> = {}) {
        super()

        this.timeout = {initial, increase, increaseIncreaser}
        for (let i = 0; i < Card.COMBINATIONS * shoe; i++)
            this.cards.push(Card.make(i))
        shuffle(this.cards, rng)

        if (this.timeout.increaseIncreaser)
            this.on(Events.playerBanned, () => this.timeout.increase += this.timeout.increaseIncreaser)
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

    get state(): State {
        return {
            cards: this.cards,
            market: this.market,
            players: this.players as Player[],
        }
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
            player.timeout = this.timeout.initial
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
        this.emit(Events.marketGrab, ret)
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
