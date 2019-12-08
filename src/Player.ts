import { SafeEmitter } from 'fancy-emitter'
import Card, { CardSet } from './Card.js'

/** @readonly Represents the state of each player in the game. */
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


  /** When taking a wrong set. */
  readonly hint = new SafeEmitter<Card>()

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
      for await (let set of this.take) {
        this.takenCards.push(set)
        this.score += nextSetValue(this)
      }
    })();

    // When being unbanned
    (async () => {
      for await (let _ of this.unban)
        this.isBanned = false
    })();

    // When being banned
    (async () => {
      for await (let _ of this.ban) {
        this.banCount++
        this.score -= nextBanCost(this)
        if (this.timeout) {
          this.isBanned = true
          setTimeout(this.unban.activate, this.timeout)
          this.timeout = nextTimeout(this)
        }
      }
    })();

    // When getting a hint
    (async () => {
      for await (let card of this.hint) {
        this.hintCards.push(card)
        this.hintCount++
        this.score -= nextHintCost(this)
      }
    })()

    this.timeout = nextTimeout(this)
  }
}
