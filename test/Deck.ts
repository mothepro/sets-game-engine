import 'should'
import Card, {Color, Opacity, Quantity, Shape} from '../src/Card'
import Deck from '../src/Deck'

class MutableDeck extends Deck {
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
let noSet: Card[]

before(() => {
    noSet = [
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
        new Card(Color.RED, Shape.SQUARE, Quantity.THREE, Opacity.SOLID),
        new Card(Color.RED, Shape.SQUARE, Quantity.THREE, Opacity.SOLID),
        new Card(Color.RED, Shape.SQUARE, Quantity.TWO, Opacity.HALF),
        new Card(Color.RED, Shape.SQUARE, Quantity.TWO, Opacity.HALF),
        new Card(Color.RED, Shape.SQUARE, Quantity.ONE, Opacity.SOLID),
        new Card(Color.RED, Shape.SQUARE, Quantity.ONE, Opacity.SOLID),
        new Card(Color.GREEN, Shape.SQUARE, Quantity.ONE, Opacity.SOLID),
        new Card(Color.GREEN, Shape.SQUARE, Quantity.ONE, Opacity.SOLID),
    ]
})

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

    it('should not make a set', done => {
        Card.hasSet(noSet).should.be.false()
        done()
    })
})

describe('Deck', () => {
    it('Market should fill up normally', done => {
        const deck = new MutableDeck

        deck.market.length.should.equal(0)
        deck.makeMarket()

        deck.market.length.should.be.oneOf(
            MutableDeck.MARKET_SIZE,
            MutableDeck.MARKET_SIZE + MutableDeck.MARKET_INC,
            MutableDeck.MARKET_SIZE + MutableDeck.MARKET_INC + MutableDeck.MARKET_INC,
        )
        done()
    })

    it('Market should fill up all the way because a set can\'t be made.', done => {
        const deck = new MutableDeck
        deck.setCards(noSet)
        deck.market.should.be.empty()
        deck.makeMarket()
        deck.market.length.should.be.equal(noSet.length)
        done()
    })
})