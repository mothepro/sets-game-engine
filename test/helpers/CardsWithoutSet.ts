import Card from '../../src/Card.js'
import { Quantity, Opacity, Shape, Color } from '../../src/Details.js'

export default [
  new Card(Color.BLUE,  Shape.CIRCLE, Quantity.ONE,   Opacity.EMPTY),
  new Card(Color.BLUE,  Shape.CIRCLE, Quantity.ONE,   Opacity.EMPTY),
  new Card(Color.BLUE,  Shape.CIRCLE, Quantity.ONE,   Opacity.SOLID),
  new Card(Color.BLUE,  Shape.CIRCLE, Quantity.ONE,   Opacity.SOLID),
  new Card(Color.RED,   Shape.SQUARE, Quantity.THREE, Opacity.SOLID),
  new Card(Color.RED,   Shape.SQUARE, Quantity.THREE, Opacity.SOLID),
  new Card(Color.RED,   Shape.SQUARE, Quantity.TWO,   Opacity.HALF),
  new Card(Color.RED,   Shape.SQUARE, Quantity.TWO,   Opacity.HALF),
  new Card(Color.RED,   Shape.SQUARE, Quantity.ONE,   Opacity.SOLID),
  new Card(Color.RED,   Shape.SQUARE, Quantity.ONE,   Opacity.SOLID),
  new Card(Color.GREEN, Shape.SQUARE, Quantity.ONE,   Opacity.SOLID),
  new Card(Color.GREEN, Shape.SQUARE, Quantity.ONE,   Opacity.SOLID),
]
