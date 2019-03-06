import 'should'
import Card, { Details, CardSet } from '../src/Card'
import Market from '../src/Market';

describe('Card', () => {
    it('details should match', done => {
        const card1 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
        const card2 = Card.make(card1.encoding)

        card1.opacity.should.eql(card2.opacity)
        card1.shape.should.eql(card2.shape)
        card1.quantity.should.eql(card2.quantity)
        card1.color.should.eql(card2.color)
        done()
    })

    it('encoding should match', done => {
        const card1 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
        const card2 = Card.make(card1.encoding)

        card1.encoding.should.equal(card2.encoding)
        done()
    })

    describe('Make a valid set', () => {
        it('all same', done => {
            const card1 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
            const card2 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
            const card3 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)

            Card.isSet(card1, card2, card3).should.be.true()
            done()
        })

        it('some same, some different', done => {
            const card1 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
            const card2 = new Card(Details.Color.GREEN, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.EMPTY)
            const card3 = new Card(Details.Color.RED, Details.Shape.CIRCLE, Details.Quantity.THREE, Details.Opacity.EMPTY)

            Card.isSet(card1, card2, card3).should.be.true()
            done()
        })

        it('all different', done => {
            const card1 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
            const card2 = new Card(Details.Color.GREEN, Details.Shape.SQUARE, Details.Quantity.TWO, Details.Opacity.HALF)
            const card3 = new Card(Details.Color.RED, Details.Shape.TRIANGLE, Details.Quantity.THREE, Details.Opacity.SOLID)

            Card.isSet(card1, card2, card3).should.be.true()
            done()
        })
    })

    describe('Make an invalid set', () => {
        it('two same one different', done => {
            const card1 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
            const card2 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
            const card3 = new Card(Details.Color.GREEN, Details.Shape.SQUARE, Details.Quantity.TWO, Details.Opacity.HALF)

            Card.isSet(card1, card2, card3).should.be.false()
            done()
        })
        it('all same, except one color diff', done => {
            const card1 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
            const card2 = new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)
            const card3 = new Card(Details.Color.GREEN, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY)

            Card.isSet(card1, card2, card3).should.be.false()
            done()
        })
    })

    describe('Having a set', () => {
        it('all same', done => {
            const cards = [
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
            ]
            const market = new Market
            market.pushCards(...cards as CardSet)
            market.solution.should.not.be.false()
            done()
        })

        it('all different', done => {
            const cards = [
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.GREEN, Details.Shape.SQUARE, Details.Quantity.TWO, Details.Opacity.HALF),
                new Card(Details.Color.RED, Details.Shape.TRIANGLE, Details.Quantity.THREE, Details.Opacity.SOLID),
            ]
            const market = new Market
            market.pushCards(...cards as CardSet)
            market.solution.should.not.be.false()
            done()
        })

        it('some same, some different', done => {
            const cards = [
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.GREEN, Details.Shape.CIRCLE, Details.Quantity.TWO, Details.Opacity.EMPTY),
                new Card(Details.Color.RED, Details.Shape.CIRCLE, Details.Quantity.THREE, Details.Opacity.EMPTY),
            ]
            const market = new Market
            market.pushCards(...cards as CardSet)
            market.solution.should.not.be.false()
            done()
        })
    })

    describe('Doesn\'t have a set', () => {
        it('two pairs', done => {
            const cards = [
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.RED, Details.Shape.SQUARE, Details.Quantity.THREE, Details.Opacity.SOLID),
                new Card(Details.Color.RED, Details.Shape.SQUARE, Details.Quantity.THREE, Details.Opacity.SOLID),
            ]
            const market = new Market
            market.pushCards(...cards as CardSet)
            market.solution.should.be.false()
            done()
        })

        it('one pair', done => {
            const cards = [
                new Card(Details.Color.BLUE, Details.Shape.CIRCLE, Details.Quantity.ONE, Details.Opacity.EMPTY),
                new Card(Details.Color.RED, Details.Shape.SQUARE, Details.Quantity.THREE, Details.Opacity.SOLID),
            ]
            const market = new Market
            market.pushCards(...cards as CardSet)
            market.solution.should.be.false()
            done()
        })
    })
})