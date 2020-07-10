import 'should'
import Game, { Card, CardSet } from '../index'
import CardsWithoutSet from './helpers/CardsWithoutSet.js'

describe('Game\'s Deck', () => {
  it('Market should fill up normally', () => {
    const game = new Game

    game.cards.length.should.be.oneOf(
      Game.MARKET_MINIMUM,
      Game.MARKET_MINIMUM + Game.MARKET_INCREASE,
      Game.MARKET_MINIMUM + Game.MARKET_INCREASE + Game.MARKET_INCREASE)

    game.filled.isAlive.should.be.true()
  })

  it('Market should fill up all the way because a set can\'t be made', () => {
    const shouldBeImmutable = CardsWithoutSet.length

    const game = new Game(undefined, CardsWithoutSet)

    game.cards.should.have.size(shouldBeImmutable)
    game.filled.isAlive.should.be.false()
  })

  it('Deck should be complete', () => {
    const game = new Game(undefined, [])

    game.filled.isAlive.should.be.false()
  })

  it('Should remove cards and end game', async () => {
    const set = [
      Card.make(1),
      Card.make(1),
      Card.make(1),
    ] as CardSet,
      game = new Game(undefined, [
        CardsWithoutSet[0],
        set[0],
        CardsWithoutSet[1],
        set[1],
        CardsWithoutSet[2],
        CardsWithoutSet[3],
        set[2],
        CardsWithoutSet[4],
      ])

    game.cards.should.have.size(8)

    game.takeSet(game.players[0], set).should.be.true()
    const takenSet = await game.players[0].take.next

    takenSet.should.eql(set)
    game.cards.should.have.size(5)
    game.filled.isAlive.should.be.false()
  })

  it('Should remove cards and keep order', async () => {
    const set = [
      Card.make(1),
      Card.make(1),
      Card.make(1),
    ] as CardSet,
      set2 = [
        Card.make(2),
        Card.make(2),
        Card.make(2),
      ] as CardSet,
      game = new Game(undefined, [
        CardsWithoutSet[0],
        set[0],
        CardsWithoutSet[1],
        set[1],
        CardsWithoutSet[2],
        CardsWithoutSet[3],
        set[2],
        CardsWithoutSet[4],
        CardsWithoutSet[5],

        // Refilled set
        set2[0],
        set2[1],
        set2[2],
      ])

    game.cards.should.have.size(9)
    await game.filled.next

    game.takeSet(game.players[0], set)
    await game.filled.next

    game.filled.isAlive.should.be.true()
    game.filled.count.should.eql(2)
    game.cards[1].should.eql(set2[0])
    game.cards[3].should.eql(set2[1])
    game.cards[6].should.eql(set2[2])
  })
})
