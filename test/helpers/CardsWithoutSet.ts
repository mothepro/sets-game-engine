import Card, {Color, Opacity, Quantity, Shape} from '../../src/Card'

const CardsWithoutSet: Card[] = [
    new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
    new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY),
    new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
    new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.SOLID),
    new Card(Color.RED, Shape.SQUARE, Quantity.THREE, Opacity.SOLID),
    new Card(Color.RED, Shape.SQUARE, Quantity.THREE, Opacity.SOLID),
    new Card(Color.RED, Shape.SQUARE, Quantity.TWO, Opacity.HALF),
    new Card(Color.RED, Shape.SQUARE, Quantity.TWO, Opacity.HALF),
    new Card(Color.RED, Shape.SQUARE, Quantity.ONE, Opacity.SOLID),
    new Card(Color.RED, Shape.SQUARE, Quantity.ONE, Opacity.SOLID),
    new Card(Color.GREEN, Shape.SQUARE, Quantity.ONE, Opacity.SOLID),
    new Card(Color.GREEN, Shape.SQUARE, Quantity.ONE, Opacity.SOLID),
]

export default CardsWithoutSet

describe('Test Helpers', () => {
    it('Should not make a set', done => {
        Card.hasSet(CardsWithoutSet).should.be.false()
        done()
    })
})
