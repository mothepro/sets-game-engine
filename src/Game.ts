import Market from './Market'
import Player from './Player'
import Card, {Set} from './Card'
import * as shuffle from 'shuffle-array'

// TODO: Emit Events.
export default class Game {
    private readonly players: Set<Player> = new Set

    /** Playable cards. */
    protected cards: Card[] = []

    /** The cards shown the players. */
    public market = new Market

    /** Whether the game is started and currently being played.*/
    private inProgress = false

    constructor({shoe = 1} = {}) {
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

    /** Adds a new player to the game before starting. */
    public addPlayer(player: Player): this {
        if (!this.inProgress)
            this.players.add(player.setGame(this))
        return this
    }

    /** Ready up. */
    public start() {
        this.fillMarket()
    }

    /** Currently winning players. */
    public getWinners(): Player[] {
        const winners = []
        const maxSets = [...this.players].reduce(
            (maxScore, player) => Math.max(maxScore, player.score), 0)
        for(const player of this.players)
            if(player.score == maxSets)
                winners.push(player)
        return winners
    }

    /** Whether a set of cards in the market is valid to take. */
    public checkSet(...indexs: Set.Indexs): boolean {
        return Card.isSet(...this.market.cards.filter(
            (_, index) => indexs.includes(index)) as Set.Cards)
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
    }
}
