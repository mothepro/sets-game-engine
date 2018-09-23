import Card, {Set} from './Card'
import * as shuffle from 'shuffle-array'

export default class Deck {
    /** Playable cards_. */
    protected cards: Card[] = []

    /** The cards_ shown the players. */
    public market = new Market

    constructor(shoe = 1) {
        for (let i = 0; i < Card.COMBINATIONS * shoe; i++)
            this.cards.push(Card.make(i))
        shuffle(this.cards)
    }

    get isEmpty(): boolean {
        return this.cards.length === 0
    }

    /** Whether any more sets can be made. */
    get isDone(): boolean {
        return this.isEmpty && !this.market.isPlayable
    }

    /** Fill the market with cards_. */
    public fillMarket(): void {
        while (this.cards.length && !this.market.isFull)
            this.market.pushCards(...this.cards.splice(0, 3) as Set.Cards)
    }
}

class Market {
    /** The number of cards_ that are shown in the market. */
    protected static readonly SIZE = 9

    protected cards_: Card[] = []

    get cards(): ReadonlyArray<Card> {
        return this.cards_
    }

    get isPlayable(): boolean {
        return Card.hasSet(this.cards_)
    }

    get isFull(): boolean {
        return this.isPlayable && this.cards_.length >= Market.SIZE
    }

    /** Pushes new cards_ into the market. */
    public pushCards(...cards: Set.Cards) {
        this.cards_.push(...cards)
    }

    /** Pops a Set from the Market. */
    public popSet(...indexs: Set.Indexs): Set.Cards {
        const ret = []
        for(const index of indexs) {
            ret.push(this.cards_[index])
            delete this.cards_[index]
        }

        // remove non cards_
        this.cards_ = this.cards_.filter(card => card instanceof Card)

        return ret as Set.Cards
    }
}
