import { Color, Quantity, Shape, Opacity } from '../src/Details'
import { Card, CardSet, Player, Game } from '..'
import CardsWithoutSet from './helpers/CardsWithoutSet.js'
import asyncRunner from './helpers/asyncRunner.js'

/** Keep taking this set, player should be banned eventually. */
const keepTaking = (player: Player, game: Game) =>
  setInterval(() => game.takeSet(player, ...game.playableCards.slice(0, 3) as CardSet), 10)

describe('Players', () => {
  it('should ban', done => {
    const player = new Player(() => 1, () => 0, () => 0, () => 0),
      game = new Game([player])

    player.ban.on(() => {
      player.banCount.should.eql(1)
      clearInterval(interval)
      done()
    })

    const interval = keepTaking(player, game)
  })

  it('should ban and increase', async () => {
    const expectedTimeouts = [1, 2, 4]
    let interval: NodeJS.Timer

    const player = new Player(
      (player) => player.timeout == 0 ? 1 : player.timeout * 2,
      () => 0, () => 0, () => 0),
      game = new Game([player])

    return asyncRunner(
      async () => {
        let times = 0
        for await (const timeout of player.ban) {
          times++
          timeout.should.eql(expectedTimeouts.shift())
          if (!expectedTimeouts.length)
            break
        }
        expectedTimeouts.should.be.empty()
        times.should.eql(3)
      },
      async () => interval = keepTaking(player, game),
    ).then(() => clearInterval(interval!))
  })

  it('should get the winners', () => {
    const set1: CardSet = [
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.HALF),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
    ],
    set2: CardSet = [
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.HALF),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
    ],
    player1 = new Player(() => 0, () => 0, () => 0, () => 0),
    player2 = new Player(() => 0, () => 0, () => 0, () => 0),
    game = new Game([player1, player2], undefined, [
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

    game.maxScore.should.eql(0)
    game.winners.should.containEql(player1)
    game.winners.should.containEql(player2)

    game.takeSet(player2, ...set1)
    
    game.maxScore.should.eql(1)
    game.winners.should.have.size(1)
    game.winners.should.containEql(player2)
    
    game.takeSet(player1, ...set2)

    game.maxScore.should.eql(1)
    game.winners.should.have.size(2)
    game.winners.should.containEql(player1)
    game.winners.should.containEql(player2)
  })

  it('should not be able to play during ban', done => {
    const set: CardSet = [
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.HALF),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
    ],
      player = new Player(() => 1, () => 0, () => 0, () => 0),
      game = new Game([player], undefined, [
      CardsWithoutSet[0],
      set[0],
      CardsWithoutSet[1],
      set[1],
      CardsWithoutSet[2],
      CardsWithoutSet[3],
      set[2],
      CardsWithoutSet[4],
    ])

    setImmediate(() => { // wait until the promises have been resolved
      player.ban.on(() => {
        game.takeSet(player, ...set).should.eql(false) // valid, but banned
        player.takenCards.should.have.size(0)
      })

      player.unban.on(() => {
        game.takeSet(player, ...set).should.eql(true)
        player.takenCards.should.have.size(1)
        done()
      })

      game.takeSet(player, CardsWithoutSet[0], CardsWithoutSet[1], CardsWithoutSet[2])
    })
  })

  it('should give a single hint to player', () => {
    const set: CardSet = [
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.TWO, Opacity.EMPTY),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.TWO, Opacity.HALF),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.TWO, Opacity.SOLID),
    ],
      player = new Player(() => 1, () => 0, () => 0, () => 0),
      game = new Game([player], undefined, [
        CardsWithoutSet[0],
        set[0],
        CardsWithoutSet[1],
        set[1],
        CardsWithoutSet[2],
        CardsWithoutSet[3],
        set[2],
        CardsWithoutSet[4],
      ])

    player.hintCount.should.eql(0)
    player.hintCards.should.be.empty()

    game.getNewHint(player).should.be.true()
    player.hintCount.should.eql(1)
    player.hintCards.should.have.size(1)
    player.hintCards[0].should.equalOneOf(set)
  })

  it('should give all hints to player', () => {
    const set: CardSet = [
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.TWO, Opacity.EMPTY),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.TWO, Opacity.HALF),
      new Card(Color.BLUE, Shape.CIRCLE, Quantity.TWO, Opacity.SOLID),
    ],
      player = new Player(() => 1, () => 0, () => 0, () => 0),
      game = new Game([player], undefined, [
        CardsWithoutSet[0],
        set[0],
        CardsWithoutSet[1],
        set[1],
        CardsWithoutSet[2],
        CardsWithoutSet[3],
        set[2],
        CardsWithoutSet[4],
      ])

    game.getNewHint(player).should.be.true()
    game.getNewHint(player).should.be.true()
    game.getNewHint(player).should.be.true()
    game.getNewHint(player).should.be.false()
    game.getNewHint(player).should.be.false()

    player.hintCount.should.eql(3)
    player.hintCards.should.have.size(3)
    player.hintCards.should.containEql(set[0])
    player.hintCards.should.containEql(set[1])
    player.hintCards.should.containEql(set[2])
  })
})
