import Card, { Details } from '../../src/Card'

const CardsWithoutSet: Card[] = [
    new Card(Details.Color.BLUE, Details.Shape.CIRCLE,  Details.Quantity.ONE,   Details.Opacity.EMPTY),
    new Card(Details.Color.BLUE, Details.Shape.CIRCLE,  Details.Quantity.ONE,   Details.Opacity.EMPTY),
    new Card(Details.Color.BLUE, Details.Shape.CIRCLE,  Details.Quantity.ONE,   Details.Opacity.SOLID),
    new Card(Details.Color.BLUE, Details.Shape.CIRCLE,  Details.Quantity.ONE,   Details.Opacity.SOLID),
    new Card(Details.Color.RED,  Details.Shape.SQUARE,  Details.Quantity.THREE, Details.Opacity.SOLID),
    new Card(Details.Color.RED,  Details.Shape.SQUARE,  Details.Quantity.THREE, Details.Opacity.SOLID),
    new Card(Details.Color.RED,  Details.Shape.SQUARE,  Details.Quantity.TWO,   Details.Opacity.HALF),
    new Card(Details.Color.RED,  Details.Shape.SQUARE,  Details.Quantity.TWO,   Details.Opacity.HALF),
    new Card(Details.Color.RED,  Details.Shape.SQUARE,  Details.Quantity.ONE,   Details.Opacity.SOLID),
    new Card(Details.Color.RED,  Details.Shape.SQUARE,  Details.Quantity.ONE,   Details.Opacity.SOLID),
    new Card(Details.Color.GREEN, Details.Shape.SQUARE, Details.Quantity.ONE,   Details.Opacity.SOLID),
    new Card(Details.Color.GREEN, Details.Shape.SQUARE, Details.Quantity.ONE,   Details.Opacity.SOLID),
]

export default CardsWithoutSet

describe('Test Helpers', () => {
    it('Should not make a set', done => {
        Card.hasSet(CardsWithoutSet).should.be.false()
        done()
    })
})
