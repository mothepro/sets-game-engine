import 'should'
import Game, { Card } from '../index'
import { Quantity, Opacity, Shape, Color } from '../src/Details.js'
import CardsWithoutSet from './helpers/CardsWithoutSet.js'

describe('Card', () => {
  it('details should match', done => {
    const card1 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
    const card2 = Card.make(card1.encoding)

    card1.opacity.should.eql(card2.opacity)
    card1.shape.should.eql(card2.shape)
    card1.quantity.should.eql(card2.quantity)
    card1.color.should.eql(card2.color)
    done()
  })

  it('encoding should match', done => {
    const card1 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
    const card2 = Card.make(card1.encoding)

    card1.encoding.should.equal(card2.encoding)
    done()
  })

  describe('Make a valid set', () => {
    it('all same', done => {
      const card1 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
      const card2 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
      const card3 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)

      Card.isSet(card1, card2, card3).should.be.true()
      done()
    })

    it('some same, some different', done => {
      const card1 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
      const card2 = new Card(Color.GREEN, Shape.CIRCLE, Quantity.TWO, Opacity.EMPTY)
      const card3 = new Card(Color.RED, Shape.CIRCLE, Quantity.THREE, Opacity.EMPTY)

      Card.isSet(card1, card2, card3).should.be.true()
      done()
    })

    it('all different', done => {
      const card1 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
      const card2 = new Card(Color.GREEN, Shape.SQUARE, Quantity.TWO, Opacity.HALF)
      const card3 = new Card(Color.RED, Shape.TRIANGLE, Quantity.THREE, Opacity.SOLID)

      Card.isSet(card1, card2, card3).should.be.true()
      done()
    })
  })

  describe('Make an invalid set', () => {
    it('two same one different', done => {
      const card1 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
      const card2 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
      const card3 = new Card(Color.GREEN, Shape.SQUARE, Quantity.TWO, Opacity.HALF)

      Card.isSet(card1, card2, card3).should.be.false()
      done()
    })
    it('all same, except one color diff', done => {
      const card1 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
      const card2 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
      const card3 = new Card(Color.GREEN, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)

      Card.isSet(card1, card2, card3).should.be.false()
      done()
    })
  })

  describe('Having a set', () => {
    it('all same', done => {
      const cards = [
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
      ],
        game = new Game(undefined, cards)

      game.solution.should.not.be.false()
      done()
    })

    it('all different', done => {
      const cards = [
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.GREEN, Shape.SQUARE, Quantity.TWO, Opacity.HALF),
        new Card(Color.RED, Shape.TRIANGLE, Quantity.THREE, Opacity.SOLID),
        Card.make(0), Card.make(0)
      ],
        game = new Game(undefined, cards)

      game.solution.should.not.be.false()
      done()
    })

    it('some same, some different', done => {
      const cards = [
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.GREEN, Shape.CIRCLE, Quantity.TWO, Opacity.EMPTY),
        new Card(Color.RED, Shape.CIRCLE, Quantity.THREE, Opacity.EMPTY),
      ],
        game = new Game(undefined, cards)

      game.solution.should.not.be.false()
      done()
    })
  })

  describe('Doesn\'t have a set', () => {
    it('two pairs', done => {
      const cards = [
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.RED, Shape.SQUARE, Quantity.THREE, Opacity.SOLID),
        new Card(Color.RED, Shape.SQUARE, Quantity.THREE, Opacity.SOLID),
      ],
        game = new Game(undefined, cards)

      game.solution.should.be.false()
      done()
    })

    it('one pair', done => {
      const cards = [
        new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
        new Card(Color.RED, Shape.SQUARE, Quantity.THREE, Opacity.SOLID),
      ],
        game = new Game(undefined, cards)

      game.solution.should.be.false()
      done()
    })

    it('Should not make a set', done => {
      const game = new Game(undefined, CardsWithoutSet)
      game.solution.should.be.false()
      done()
    })
  })
})
