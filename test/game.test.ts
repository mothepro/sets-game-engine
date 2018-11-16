import 'should'
import CardsWithoutSet from './helpers/CardsWithoutSet'
import Card, { Details } from '../src/Card'
import Player from '../src/Player'
import Game from '../src/Game'
import { Events } from '../src/events'
import Market from '../src/Market'

const MARKET_SIZE = 9 // Default number of cards on screen
const MARKET_INC = 3  // Size of Set

describe('Game\'s Deck', () => {
    it('Market should fill up normally', () => {
        const game = new Game

        game.playableCards.length.should.equal(0)
        game.start()

        game.playableCards.length.should.be.oneOf(
            MARKET_SIZE,
            MARKET_SIZE + MARKET_INC,
            MARKET_SIZE + MARKET_INC + MARKET_INC,
        )
        game.isDone.should.be.false()
    })

    it('Market should fill up all the way because a set can\'t be made', () => {
        const game = new Game
        game.setCards(CardsWithoutSet)
        game.playableCards.should.be.empty()
        game.start()
        game.playableCards.length.should.be.equal(CardsWithoutSet.length)
        game.isDone.should.be.true()
    })

    it('Deck should be complete', () => {
        const game = new Game
        game.isDone.should.be.false()
        game.setCards([])
        game.isDone.should.be.true()
    })

    it('Should remove cards and keep order', () => {
        const game = new Game
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

        const market = game['market'] // Private member
        const removedCards = market.popSet(1, 3, 6)

        removedCards.length.should.eql(3)
        removedCards.should.containEql(card1)
        removedCards.should.containEql(card2)
        removedCards.should.containEql(card3)
        game.playableCards.length.should.eql(5)
        for(const card of game.playableCards)
            card.encoding.should.eql(5)
    })

    it('Give me a hint', () => {
        const game = new Game

        game.setCards([
            Card.make(5),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
            Card.make(5),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.HALF),
            Card.make(12),
            Card.make(12),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.SOLID),
            Card.make(13),
        ])
        game.start()

        const hint = game.hint()
        hint.should.containEql(1)
        hint.should.containEql(3)
        hint.should.containEql(6)
    })

    it('Don\'t give me a hint', () => {
        const game = new Game
        game.setCards(CardsWithoutSet)
        game.start()

        ;(() => game.hint()).should.throw()
    })
})

describe('Players', () => {
    it('should ban', done => {
        const game = new Game({nextTimeout: () => 1})
        const player = new Player

        game.on(Events.playerBanned, ({player: bannedPlayer, timeout}) => {
            'number'.should.eql(typeof timeout)
            player.should.eql(bannedPlayer)

            clearInterval(interval)
            done()
        })

        game.addPlayer(player).start()

        // keep taking this set, player should be banned eventually.
        const interval = setInterval(() => player.takeSet(1, 2, 3), 10)
    })

    it('should ban and increase', done => {
        const expectedTimeouts = [1, 2, 4]

        const game = new Game({
            nextTimeout: (old) => old == 0 ? 1 : old * 2
        })
        const player = new Player
        game.addPlayer(player)

        game.on(Events.playerBanned, ({player: bannedPlayer, timeout}) => {
            timeout.should.eql(expectedTimeouts.shift())
            player.should.eql(bannedPlayer)

            if(!expectedTimeouts.length) {
                clearInterval(interval)
                done()
            }
        })

        game.start()

        // keep taking this sets
        const interval = setInterval(() => player.takeSet(1, 2, 3), 10)
    })

    it('should get the winners', () => {
        const player1 = new Player
        const player2 = new Player
        const game = new Game

        game.setCards([
            Card.make(5),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
            Card.make(5),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.HALF),
            Card.make(5),
            Card.make(5),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.SOLID),
            Card.make(5),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.HALF),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.SOLID),
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
        const game = new Game({nextTimeout: () => 1})
        const player = new Player

        game.setCards([
            Card.make(5),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
            Card.make(5),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.HALF),
            Card.make(5),
            Card.make(5),
            new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.SOLID),
            Card.make(5),
        ])
        game.addPlayer(player).start()

        game.on(Events.playerBanned, ({player: bannedPlayer}) => {
            player.should.eql(bannedPlayer)
            player.takeSet(1, 3, 6).should.eql(false) // valid, but banned
            player.score.should.eql(0)
        })

        game.on(Events.playerUnbanned, unbannedPlayer => {
            player.should.eql(unbannedPlayer)
            player.takeSet(1, 3, 6).should.eql(true)
            player.score.should.eql(1)
            done()
        })

        // invalid
        player.takeSet(1, 2, 3)
    })
})
