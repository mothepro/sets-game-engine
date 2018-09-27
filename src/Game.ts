import Market from './Market'
import Player from './Player'
import Card, {Set} from './Card'
import * as shuffle from 'shuffle-array'
import StrictEventEmitter from 'strict-event-emitter-types'
import { EventEmitter } from 'events'

export interface Events {
    start: void,
    finish: void,
    playerBanned: (p: Player, time: number) => void,
    playerUnbanned: Player,
    playerAdded: Player,
    marketFilled: void,
    marketGrab: Set.Cards
}

export interface State {
    readonly cards: ReadonlyArray<Card>,
    readonly market: Market,
    readonly players: ReadonlyArray<Player>,
}

export default class Game
    extends (EventEmitter as { new(): StrictEventEmitter<EventEmitter, Events>}) {
    private readonly players_: Set<Player> = new Set

    /** Playable cards. */
    protected readonly cards: Card[] = []

    /** The cards shown the players. */
    protected readonly market = new Market

    /** Whether the game is started and currently being played.*/
    protected inProgress = false

    constructor({shoe = 1} = {}) {
        super()
        for (let i = 0; i < Card.COMBINATIONS * shoe; i++)
            this.cards.push(Card.make(i))
        shuffle(this.cards)
    }

    get isDeckEmpty(): boolean {
        return this.cards.length === 0
    }

    /** Whether any more sets can be made. */
    get isDone(): boolean {
        return this.isDeckEmpty && !this.market.isPlayable
    }

    get unplayableCards(): number {
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
        if (!this.inProgress) {
            player.game = this
            this.players_.add(player)
            this.emit('playerAdded', player)
        }
        return this
    }

    /** Ready up. */
    public start() {
        this.emit('start')
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
        this.emit('marketGrab', ret)
        this.fillMarket()
        return ret
    }

    /** Fill the market with cards. */
    private fillMarket(): void {
        while (this.cards.length && !this.market.isFull)
            this.market.pushCards(...this.cards.splice(0, 3) as Set.Cards)
        this.inProgress = !this.isDone
        this.emit(this.inProgress ? 'marketFilled' : 'finish')
    }
}
