import Card from './Card'
import { COMBINATIONS } from './Details'

/** Generates each possible unique card in a random order. */
export default function*() {
  const cards = [...Array(COMBINATIONS)].map((_, i) => Card.make(i))
  while (cards.length) {
    console.log('cards left', cards.length)
    yield cards.splice(Math.random() * cards.length, 1)[0]
  }
}
