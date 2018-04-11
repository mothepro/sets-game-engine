import 'should'
import Deck from '../src/Deck'
import MutableDeck from './helpers/MutableDeck'
import CardsWithoutSet from './helpers/CardsWithoutSet'
import Card from '../src/Card'

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
        deck.isDone().should.be.false()
        done()
    })

    it('Market should fill up all the way because a set can\'t be made', done => {
        const deck = new MutableDeck
        deck.setCards(CardsWithoutSet)
        deck.market.should.be.empty()
        deck.makeMarket()
        deck.market.length.should.be.equal(CardsWithoutSet.length)
        deck.isDone().should.be.true()
        done()
    })

    it('Deck should be complete', done => {
        const deck = new MutableDeck
        deck.isDone().should.be.false()
        deck.clearCards()
        deck.isDone().should.be.true()
        done()
    })

    it('Should remove cards and keep order', done => {
        const deck = new MutableDeck
        const card1 = Card.make(1)
        const card2 = Card.make(2)
        const card3 = Card.make(3)
        deck.setCards([
            Card.make(5),
            card1,
            Card.make(5),
            card2,
            Card.make(5),
            Card.make(5),
            card3,
            Card.make(5),
        ]).makeMarket()

        deck.market.length.should.eql(8)

        const removedCards = deck.removeSet([1, 3, 6])

        removedCards.length.should.eql(3)
        removedCards.should.containEql(card1)
        removedCards.should.containEql(card2)
        removedCards.should.containEql(card3)
        deck.market.length.should.eql(5)
        for(const card of deck.market)
            card.encoding.should.eql(5)
        done()
    })
})