import 'should'
import MutableGame from './helpers/MutableGame'
import CardsWithoutSet from './helpers/CardsWithoutSet'
import Card from '../src/Card'

describe('Game\'s Deck', () => {
    it('Market should fill up normally', done => {
        const game = new MutableGame

        game.market.cards.length.should.equal(0)
        game.start()

        game.market.cards.length.should.be.oneOf(
            MutableGame.MARKET_SIZE,
            MutableGame.MARKET_SIZE + MutableGame.MARKET_INC,
            MutableGame.MARKET_SIZE + MutableGame.MARKET_INC + MutableGame.MARKET_INC,
        )
        game.isDone.should.be.false()
        done()
    })

    it('Market should fill up all the way because a set can\'t be made', done => {
        const game = new MutableGame
        game.setCards(CardsWithoutSet)
        game.market.cards.should.be.empty()
        game.start()
        game.market.cards.length.should.be.equal(CardsWithoutSet.length)
        game.isDone.should.be.true()
        done()
    })

    it('Deck should be complete', done => {
        const game = new MutableGame
        game.isDone.should.be.false()
        game.clearCards()
        game.isDone.should.be.true()
        done()
    })

    it('Should remove cards_ and keep order', done => {
        const game = new MutableGame
        const card1 = Card.make(1)
        const card2 = Card.make(2)
        const card3 = Card.make(3)
        game.setCards([
            Card.make(5),
            card1,
            Card.make(5),
            card2,
            Card.make(5),
            Card.make(5),
            card3,
            Card.make(5),
        ]).start()

        game.market.cards.length.should.eql(8)

        const removedCards = game.market.popSet(1, 3, 6)

        removedCards.length.should.eql(3)
        removedCards.should.containEql(card1)
        removedCards.should.containEql(card2)
        removedCards.should.containEql(card3)
        game.market.cards.length.should.eql(5)
        for(const card of game.market.cards)
            card.encoding.should.eql(5)
        done()
    })
})