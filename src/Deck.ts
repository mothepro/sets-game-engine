import Card, {Set, SetIndexs} from './Card'
import * as shuffle from 'shuffle-array'

export default class Deck {
    /** Playable cards. */
    protected cards: Card[] = []

    /** The cards shown the players. */
    protected market_: Card[] = []

    /** The number of cards that are shown in the market. */
    protected static readonly MARKET_SIZE = 9

    /** The number of cards that the market should increment by each time. */
    protected static readonly MARKET_INC = 3

    get market(): ReadonlyArray<Card> {
        return this.market_
    }

    constructor(shoe = 1) {
        for(let i = 0; i < Card.COMBINATIONS * shoe; i++)
            this.cards.push(Card.make(i))
        shuffle(this.cards)
    }

    /** Fill the market with cards. */
    public makeMarket(): void {
        // Add MARKET_INC until we have a possible set AND the minimum market size
        while(
            this.cards.length &&
            (
                this.market_.length < Deck.MARKET_SIZE ||
                !Card.hasSet(this.market_)
            )
        ) {
            for(let i = 0; i < Math.min(Deck.MARKET_INC, this.cards.length); i++)
                this.market_.push(this.cards.shift()!)
        }
    }

    /** Whether any more sets can be made. */
    public isDone(): boolean {
        return this.cards.length === 0 && !Card.hasSet(this.market_)
    }

    /** Pops a Set from the Market. */
    public removeSet(indexs: SetIndexs): Set {
        const ret = []
        for(const index of indexs) {
            ret.push(this.market_[index])
            delete this.market_[index]
        }

        // remove non cards
        this.market_ = this.market_.filter(card => card instanceof Card)

        return ret as Set
    }
}