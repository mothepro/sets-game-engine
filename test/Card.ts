import 'should'
import Card, {Color, Opacity, Quantity, Shape} from '../src/Card'

describe('Card', () => {
    it('should make the proper card', done => {
        const card1 = new Card(Color.BLUE, Shape.CIRCLE, Quantity.ONE, Opacity.EMPTY)
        const card2 = Card.make(card1.encoding)

        card1.encoding.should.equal(card2.encoding)
        card1.opacity.should.eql(card2.opacity)
        card1.shape.should.eql(card2.shape)
        card1.quantity.should.eql(card2.quantity)
        card1.color.should.eql(card2.color)
        done()
    })
})