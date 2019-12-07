import 'should'
import CardsWithoutSet from './helpers/CardsWithoutSet'
import Card, { Details, CardSet } from '../src/Card'
import Player from '../src/Player'
import Game from '../src/Game'

type AsyncFunction<T = any> = (...args: any[]) => Promise<T>

/**
 * A small utility function which returns promise
 * that resolves with the execution of all the async functions.
 */
function asyncRunner(...fns: AsyncFunction[]) {
  const promises = []
  for (const fn of fns)
    promises.push(fn())
  return Promise.all(promises)
}

describe('Game\'s Deck', () => {
  const MARKET_SIZE = 9 // Default number of cards on screen
  const MARKET_INC = 3  // Size of Set

  it('Market should fill up normally', () => {
    const game = new Game

    game.playableCards.should.be.empty()
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
    game.playableCards.should.have.size(CardsWithoutSet.length)
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

    const set: CardSet = [
      Card.make(1),
      Card.make(2),
      Card.make(3),
    ]

    game.setCards([
      CardsWithoutSet[0],
      set[0],
      CardsWithoutSet[1],
      set[1],
      CardsWithoutSet[2],
      CardsWithoutSet[3],
      set[2],
      CardsWithoutSet[4],
    ])
    game.start()

    game.playableCards.should.have.size(8)

    const market = game['market'] // Private member
    const removedCards = market.popSet(...set)
    market.cleanUp()

    removedCards.should.eql(set)
    game.playableCards.should.have.size(5)
    game.isDone.should.be.true()
  })

  it('Give me a hint', () => {
    const game = new Game

    const set: CardSet = [
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.EMPTY),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.HALF),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.SOLID),
    ]

    game.setCards([
      CardsWithoutSet[0],
      set[0],
      CardsWithoutSet[1],
      set[1],
      CardsWithoutSet[2],
      CardsWithoutSet[3],
      set[2],
      CardsWithoutSet[4],
    ])
    game.start()

    game.solution.should.eql(set)
  })

  it('Don\'t give me a hint', () => {
    const game = new Game
    game.setCards(CardsWithoutSet)
    game.start()

      ; (() => game.solution).should.throw()
  })
})

describe('Players', () => {
  it('should ban', done => {
    const game = new Game({ nextTimeout: () => 1 })
    const player = new Player

    game.playerBanned.on(({ player: bannedPlayer, timeout }) => {
      'number'.should.eql(typeof timeout)
      player.should.eql(bannedPlayer)
      player.bans.should.eql(1)

      clearInterval(interval)
      done()
    })

    game.addPlayer(player).start()

    // keep taking this set, player should be banned eventually.
    const interval = setInterval(() => player.takeSet(game.playableCards[0], game.playableCards[1], game.playableCards[3]), 10)
  })

  it('should ban and increase', async () => {
    const expectedTimeouts = [1, 2, 4]
    let interval: NodeJS.Timer

    const game = new Game({
      nextTimeout: (old) => old == 0 ? 1 : old * 2
    })
    const player = new Player
    game.addPlayer(player)

    return asyncRunner(
      async () => {
        let times = 0
        for await (const { player: bannedPlayer, timeout } of game.playerBanned) {
          times++
          timeout.should.eql(expectedTimeouts.shift())
          player.should.eql(bannedPlayer)
          if (!expectedTimeouts.length)
            break
        }
        expectedTimeouts.should.be.empty()
        times.should.eql(3)
      },
      async () => {
        game.start()

        // keep taking this sets
        interval = setInterval(() => player.takeSet(
          game.playableCards[0],
          game.playableCards[1],
          game.playableCards[3]
        ), 10)
      },
    ).then(() => clearInterval(interval!))
  })

  it('should get the winners', () => {
    const player1 = new Player
    const player2 = new Player
    const game = new Game

    const set1: CardSet = [
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.HALF),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.SOLID),
    ]
    const set2: CardSet = [
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.HALF),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.SOLID),
    ]

    game.setCards([
      CardsWithoutSet[0],
      set1[0],
      CardsWithoutSet[1],
      set1[1],
      CardsWithoutSet[2],
      CardsWithoutSet[3],
      set1[2],
      CardsWithoutSet[4],
      set2[1],
      set2[0],
      set2[2],
    ])
    game.addPlayer(player1).addPlayer(player2).start()

    game.maxScore.should.eql(0)
    game.winners.should.containEql(player1)
    game.winners.should.containEql(player2)

    player2.takeSet(...set1)

    game.maxScore.should.eql(1)
    game.winners.should.have.size(1)
    game.winners.should.containEql(player2)

    player1.takeSet(...set2)

    game.maxScore.should.eql(1)
    game.winners.should.have.size(2)
    game.winners.should.containEql(player1)
    game.winners.should.containEql(player2)
  })

  it('should not be able to play during ban', done => {
    const game = new Game({ nextTimeout: () => 1 })
    const player = new Player

    const set: CardSet = [
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.HALF),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.SOLID),
    ]

    game.setCards([
      CardsWithoutSet[0],
      set[0],
      CardsWithoutSet[1],
      set[1],
      CardsWithoutSet[2],
      CardsWithoutSet[3],
      set[2],
      CardsWithoutSet[4],
    ])
    game.addPlayer(player).start()

    setImmediate(() => { // wait until the promises have been resolved
      game.playerBanned.on(({ player: bannedPlayer }) => {
        player.should.eql(bannedPlayer)
        player.takeSet(...set).should.eql(false) // valid, but banned
        player.score.should.eql(0)
      })

      game.playerUnbanned.on(unbannedPlayer => {
        player.should.eql(unbannedPlayer)
        player.takeSet(...set).should.eql(true)
        player.score.should.eql(1)
        done()
      })

      player.takeSet(CardsWithoutSet[0], CardsWithoutSet[1], CardsWithoutSet[2])
    })
  })

  it('should give a single hint to player', () => {
    const game = new Game
    const player = new Player

    const set: CardSet = [
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.EMPTY),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.HALF),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.SOLID),
    ]

    game.setCards([
      CardsWithoutSet[0],
      set[0],
      CardsWithoutSet[1],
      set[1],
      CardsWithoutSet[2],
      CardsWithoutSet[3],
      set[2],
      CardsWithoutSet[4],
    ])
    game.addPlayer(player)
    game.start()

    player.hints.should.eql(0)
    player.hint.should.be.empty()

    player.getNewHint().should.be.true()
    player.hints.should.eql(1)
    player.hint.should.have.size(1)
    player.hint[0].should.equalOneOf(set)
  })

  it('should give all hints to player', () => {
    const game = new Game
    const player = new Player

    const set: CardSet = [
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.EMPTY),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.HALF),
      new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.SOLID),
    ]

    game.setCards([
      CardsWithoutSet[0],
      set[0],
      CardsWithoutSet[1],
      set[1],
      CardsWithoutSet[2],
      CardsWithoutSet[3],
      set[2],
      CardsWithoutSet[4],
    ])
    game.addPlayer(player)
    game.start()

    player.getNewHint().should.be.true()
    player.getNewHint().should.be.true()
    player.getNewHint().should.be.true()
    player.getNewHint().should.be.false()
    player.getNewHint().should.be.false()

    player.hints.should.eql(3)
    player.hint.should.have.size(3)
    player.hint.should.containEql(set[0])
    player.hint.should.containEql(set[1])
    player.hint.should.containEql(set[2])
  })
})

describe('Game Timer', () => {
  /**
   * setTimeout isn't perfect, the delta is aaprox 6ms on modern machines.
   *  @link https://developer.mozilla.org/en-US/docs/Web/API/Window.setTimeout#Notes
   */
  const TIMEOUT_DELTA = 6

  const DELAY = 50

  it('Game should keep track of time', done => {
    const game = new Game
    game.elapsedTime.should.eql(0)
    game.start()

    game.elapsedTime.should.be.approximately(0, TIMEOUT_DELTA)
    setTimeout(() => {
      game.elapsedTime.should.be.approximately(DELAY, TIMEOUT_DELTA)
      game.isDone.should.be.false()
      done()
    }, DELAY)
  })

  it('Game should pause time', done => {
    const game = new Game
    game.start()

    setTimeout(() => {
      game.pause()
      const elapsed = game.elapsedTime
      elapsed.should.be.approximately(DELAY, TIMEOUT_DELTA)
      setTimeout(() => {
        game.elapsedTime.should.eql(elapsed)
        done()
      }, DELAY)
    }, DELAY)
  })

  it('Game should resume time', done => {
    const game = new Game
    game.start()
    game.pause()

    setTimeout(() => {
      game.resume()
      game.elapsedTime.should.be.approximately(0, TIMEOUT_DELTA)
      setTimeout(() => {
        game.elapsedTime.should.be.approximately(DELAY, TIMEOUT_DELTA)
        done()
      }, DELAY)
    }, DELAY)
  })
})