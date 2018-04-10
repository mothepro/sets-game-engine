import 'should'
import Deck from '../src/Deck'
import MutableDeck from './helpers/MutableDeck'
import CardsWithoutSet from './helpers/CardsWithoutSet'

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
        deck.setCards(CardsWithoutSet)
        deck.market.should.be.empty()
        deck.makeMarket()
        deck.market.length.should.be.equal(CardsWithoutSet.length)
        done()
    })
})