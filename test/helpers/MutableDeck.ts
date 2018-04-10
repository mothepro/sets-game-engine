import Deck from '../../src/Deck'
import Card from '../../src/Card'

export default class MutableDeck extends Deck {
    public static readonly MARKET_SIZE = 9
    public static readonly MARKET_INC = 3

    public prependCard(card: Card): this {
        this.cards.unshift(card)
        return this
    }

    public clearCards(): this {
        this.cards = []
        return this
    }

    public getCards(): Card[] {
        return this.cards
    }

    public setCards(cards: Card[]): this {
        this.cards = [...cards]
        return this
    }
}

describe('Test Helpers', () => {
    it('Mutable Deck', done => {
        const deck = new MutableDeck
        deck.getCards().length.should.equal(Card.COMBINATIONS)

        deck.clearCards()
        deck.getCards().length.should.equal(0)

        for(let i = 0; i < 5; i++)
            deck.prependCard(Card.make(45))

        deck.getCards().length.should.equal(5)
        done()
    })
})