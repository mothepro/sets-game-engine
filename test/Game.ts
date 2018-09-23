import 'should'
import MutableGame from './helpers/MutableGame'
import CardsWithoutSet from './helpers/CardsWithoutSet'
import Card, {Color, Opacity, Quantity, Shape} from '../src/Card'
import RealPlayer from './helpers/RealPlayer'

describe('Game\'s Deck', () => {
    it('Market should fill up normally', done => {
        const game = new MutableGame

        game.playableCards.length.should.equal(0)
        game.start()

        game.playableCards.length.should.be.oneOf(
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
        game.playableCards.should.be.empty()
        game.start()
        game.playableCards.length.should.be.equal(CardsWithoutSet.length)
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

    it('Should remove cards and keep order', done => {
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

        game.playableCards.length.should.eql(8)

        const removedCards = game.getMarket().popSet(1, 3, 6)

        removedCards.length.should.eql(3)
        removedCards.should.containEql(card1)
        removedCards.should.containEql(card2)
        removedCards.should.containEql(card3)
        game.playableCards.length.should.eql(5)
        for(const card of game.playableCards)
            card.encoding.should.eql(5)
        done()
    })
})

describe('Players', () => {
    it('should ban', done => {
        let game = new MutableGame
        let player = new RealPlayer
        game.addPlayer(player)

        game.on('playerBanned', (player, timeout) => {
            player.should.eql(player)
            done()
        })

        game.start()

        // keep taking this set, player should be banned eventually.
        while(player.takeSet(1, 2, 3));
    })

    it('should not be able to play during ban', done => {
        let game = new MutableGame
        let player = new RealPlayer

        game.setCards([
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.HALF),
            Card.make(5),
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
            Card.make(5),
        ]).addPlayer(player).start()

        // invalid
        player.takeSet(1, 2, 3)

        // valid, but banned
        player.on('banned', () => {
            player.takeSet(1, 3, 6).should.eql(false)
            player.score.should.eql(0)
        })

        player.on('unbanned', () => {
            player.takeSet(1, 3, 6).should.eql(true)
            player.score.should.eql(1)
            done()
        })
    })
})