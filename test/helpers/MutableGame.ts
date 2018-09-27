import Card from '../../src/Card'
import Game from '../../src/Game'
import Market from '../../src/Market'

export default class MutableGame extends Game {
    public static readonly MARKET_SIZE = 9
    public static readonly MARKET_INC = 3

    getMarket(): Market {
        return this.market
    }

    public prependCard(card: Card): this {
        this.cards.unshift(card)
        return this
    }

    public getCards(): Card[] {
        return this.cards
    }
}

describe('Test Helpers', () => {
    it('Mutable Deck', done => {
        const deck = new MutableGame
        deck.getCards().length.should.equal(Card.COMBINATIONS)

        deck.setCards([])
        deck.getCards().length.should.equal(0)

        for(let i = 0; i < 5; i++)
            deck.prependCard(Card.make(45))

        deck.getCards().length.should.equal(5)
        done()
    })
})