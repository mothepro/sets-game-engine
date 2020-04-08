import { SafeEmitter, merge } from 'fancy-emitter'
import Card, { CardSet } from './Card.js'

/** Simple generator for players. */
function* alwaysYield<T>(val: T): Generator<T, never, Player> {
  while (true)
    yield val
}

/** 
 * Represents the state of each player in the game. 
 * @readonly The data here should only be modified or activated by the Game it is a part of.
 */
export default class Player {
  score = 0

  /** If positive, number of ms the user will be blocked for after a wrong attempt. */
  timeout = this.timeouts.next(this).value

  /** Activate when taking a set. */
  readonly take = new SafeEmitter<CardSet>(set => {
    this.takenCards.push(set)
    this.score += this.scoreIncrementer.next(this).value
  })

  /** Sets taken from the Game. */
  readonly takenCards: CardSet[] = []

  /** When taking a wrong set. */
  readonly ban = new SafeEmitter<number>(() => {
    this.score -= this.banCosts.next(this).value
    if (this.timeout) {
      this.isBanned = true
      setTimeout(this.unban.activate, this.timeout)
      this.timeout = this.timeouts.next(this).value
    }
  })

  /** When ban is over. */
  readonly unban = new SafeEmitter(() => this.isBanned = false)

  /** Whether not timed out from taking sets. */
  isBanned = false

  /** When getting a card in a possible solution. */
  readonly hint = new SafeEmitter<Card>(card => {
    this.hintCards.push(card)
    this.score -= this.hintCosts.next(this).value
  })

  /** When the current hints are no longer useful. */
  readonly hintClear = new SafeEmitter(() => this.hintCards.length = 0)

  /** When the hint changes in any way. */
  readonly hintUpdate = merge({
    hintAdd: this.hint,
    hintClear: this.hintClear,
  })

  /** Cards which make up a set in the current market. */
  readonly hintCards: Card[] = []

  constructor(
    /** 
     * How long to ban a player for a wrong take.
     * By default, no timeout for bans (Emitters will still activate.)
     */
    readonly timeouts = alwaysYield(0),
    /** How much to drop score due to a hint. (0 by default) */
    readonly hintCosts = alwaysYield(0),
    /** How much to drop score due to a wrong take. (0 by default) */
    readonly banCosts = alwaysYield(0),
    /** How much to increase score due to a good take. (1 by default) */
    readonly scoreIncrementer = alwaysYield(1),
  ) { }
}
