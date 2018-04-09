import Card from './Card'
import * as shuffle from 'shuffle-array'

export default class Deck {
    /** Playable cards. */
    protected cards: Card[] = []

    /** The cards shown the players. */
    public market: Card[] = []

    /** The number of cards that are shown in the market. */
    protected static readonly MARKET_SIZE = 9

    /** The number of cards that the market should increment by each time. */
    protected static readonly MARKET_INC = 3

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
                this.market.length < Deck.MARKET_SIZE ||
                !Card.hasSet(this.market)
            )
        ) {
            for(let i = 0; i < Math.min(Deck.MARKET_INC, this.cards.length); i++)
                this.market.push(this.cards.pop()!)
        }
    }
}