import { SafeEmitter, merge } from 'fancy-emitter'
import Card, { CardSet } from './Card.js'

/** 
 * Represents the state of each player in the game. 
 * @readonly The data here should only be modified or activated by the Game it is a part of.
*/
export default class Player {
  score = 0

  /** If positive, number of ms the user will be blocked for after a wrong attempt. */
  timeout = 0

  /** Activate when taking a set. */
  readonly take = new SafeEmitter<CardSet>()

  /** Sets taken from the Game. */
  readonly takenCards: CardSet[] = []

  /** When taking a wrong set. */
  readonly ban = new SafeEmitter<number>()

  /** When ban is over. */
  readonly unban = new SafeEmitter

  /** Number of wrong attempts */
  banCount = 0

  /** Whether not timed out from taking sets. */
  isBanned = false

  /** When getting a card in a possible solution. */
  readonly hint = new SafeEmitter<Card>()

  /** When the current hints are no longer useful. */
  readonly hintClear = new SafeEmitter

  /** When the hint changes in any way. */
  readonly hintUpdate = merge({
    hintAdd: this.hint,
    hintClear: this.hintClear,
  })

  /** Cards which make up a set in the current market. */
  readonly hintCards: Card[] = []

  /** Number of times a hint used */
  hintCount = 0

  constructor(
    /** 
     * How long to ban a player for a wrong take.
     * By default, no timeout for bans are ignored (But the emitters will still activate.)
     */
    nextTimeout = (player: Player) => 0,
    /** How much to drop score due to a hint. (0 by default) */
    nextHintCost = (player: Player) => 0,
    /** How much to drop score due to a wrong take. (0 by default) */
    nextBanCost = (player: Player) => 0,
    /** How much to increase score due to a good take. (1 by default) */
    nextSetValue = (player: Player) => 1,
  ) {
    // When taking a set
    (async () => {
      for await (const set of this.take) {
        this.takenCards.push(set)
        this.score += nextSetValue(this)
      }
    })();

    // When being unbanned
    (async () => {
      for await (const _ of this.unban)
        this.isBanned = false
    })();

    // When being banned
    (async () => {
      for await (const oldTimeout of this.ban) {
        this.banCount++
        this.score -= nextBanCost(this)
        if (this.timeout) {
          this.isBanned = true
          this.timeout = nextTimeout(this)
          setTimeout(this.unban.activate, oldTimeout)
        }
      }
    })();

    // When getting a hint
    (async () => {
      for await (const card of this.hint) {
        this.hintCards.push(card)
        this.hintCount++
        this.score -= nextHintCost(this)
      }
    })();

    // When to clear current hints
    (async () => {
      for await (const _ of this.hintClear)
        this.hintCards.length = 0
    })()

    this.timeout = nextTimeout(this)
  }
}
