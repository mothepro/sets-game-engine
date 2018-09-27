import 'should'
import MutableGame from './helpers/MutableGame'
import CardsWithoutSet from './helpers/CardsWithoutSet'
import Card, {Color, Opacity, Quantity, Shape} from '../src/Card'
import Player from '../src/Player'

describe('Game\'s Deck', () => {
    it('Market should fill up normally', () => {
        const game = new MutableGame

        game.playableCards.length.should.equal(0)
        game.start()

        game.playableCards.length.should.be.oneOf(
            MutableGame.MARKET_SIZE,
            MutableGame.MARKET_SIZE + MutableGame.MARKET_INC,
            MutableGame.MARKET_SIZE + MutableGame.MARKET_INC + MutableGame.MARKET_INC,
        )
        game.isDone.should.be.false()
    })

    it('Market should fill up all the way because a set can\'t be made', () => {
        const game = new MutableGame
        game.setCards(CardsWithoutSet)
        game.playableCards.should.be.empty()
        game.start()
        game.playableCards.length.should.be.equal(CardsWithoutSet.length)
        game.isDone.should.be.true()
    })

    it('Deck should be complete', () => {
        const game = new MutableGame
        game.isDone.should.be.false()
        game.setCards([])
        game.isDone.should.be.true()
    })

    it('Should remove cards and keep order', () => {
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
        ])
        game.start()

        game.playableCards.length.should.eql(8)

        const removedCards = game.getMarket().popSet(1, 3, 6)

        removedCards.length.should.eql(3)
        removedCards.should.containEql(card1)
        removedCards.should.containEql(card2)
        removedCards.should.containEql(card3)
        game.playableCards.length.should.eql(5)
        for(const card of game.playableCards)
            card.encoding.should.eql(5)
    })
})

describe('Players', () => {
    it('should ban', done => {
        const game = new MutableGame
        const player = new Player
        game.addPlayer(player)

        game.on('playerBanned', (player, timeout) => {
            player.should.eql(player)
            done()
        })

        game.start()

        // keep taking this set, player should be banned eventually.
        while(player.takeSet(1, 2, 3));
    })

    it('should get the winners', () => {
        const game = new MutableGame
        const player1 = new Player
        const player2 = new Player

        game.setCards([
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.HALF),
            Card.make(5),
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.HALF),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
        ])
        game.addPlayer(player1).addPlayer(player2).start()

        game.maxScore.should.eql(0)
        game.winners.should.containEql(player1)
        game.winners.should.containEql(player2)

        player2.takeSet(1, 3, 6)

        game.maxScore.should.eql(1)
        game.winners.length.should.eql(1)
        game.winners.should.containEql(player2)

        player1.takeSet(5, 6, 7)

        game.maxScore.should.eql(1)
        game.winners.length.should.eql(2)
        game.winners.should.containEql(player1)
        game.winners.should.containEql(player2)
    })

    it('should not be able to play during ban', done => {
        const game = new MutableGame
        const player = new Player

        game.setCards([
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.HALF),
            Card.make(5),
            Card.make(5),
            new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
            Card.make(5),
        ])
        game.addPlayer(player).start()

        // invalid
        player.takeSet(1, 2, 3)

        // valid, but banned
        game.on('playerBanned', (bannedPlayer, timeout) => {
            player.should.eql(bannedPlayer)
            player.takeSet(1, 3, 6).should.eql(false)
            player.score.should.eql(0)
        })

        game.on('playerUnbanned', (unbannedPlayer) => {
            player.should.eql(unbannedPlayer)
            player.takeSet(1, 3, 6).should.eql(true)
            player.score.should.eql(1)
            done()
        })
    })
})