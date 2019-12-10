import 'should'
import Game, { Card } from '..'
import CardsWithoutSet from './helpers/CardsWithoutSet.js'

describe('Game\'s Deck', () => {
  const MARKET_SIZE = 9 // Default number of cards on screen
  const MARKET_INC = 3  // Size of Set

  it('Market should fill up normally', () => {
    const game = new Game

    game.cards.length.should.be.oneOf(
      MARKET_SIZE,
      MARKET_SIZE + MARKET_INC,
      MARKET_SIZE + MARKET_INC + MARKET_INC,
    )
    game.finished.triggered.should.be.false()
  })

  it('Market should fill up all the way because a set can\'t be made', () => {
    const shouldBeImmutable = CardsWithoutSet.length
    const game = new Game(undefined, CardsWithoutSet)
    game.cards.should.have.size(shouldBeImmutable)
    game.finished.triggered.should.be.true()
  })

  it('Deck should be complete', () => {
    const game = new Game(undefined, [])
    game.finished.triggered.should.be.true()
  })

  it('Should remove cards and keep order', done => {
    const set = [
      Card.make(1),
      Card.make(1),
      Card.make(1),
    ] as const,
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

    game.takeSet(game.players[0], ...set).should.be.true()



    game.players[0].take.on(cards => {
      cards.should.eql(set)
      game.cards.should.have.size(5)
      game.finished.triggered.should.be.true()
      done()
    })
  })
})
