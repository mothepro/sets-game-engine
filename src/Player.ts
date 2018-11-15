import { Set } from './Card'
import { Events } from './events'
import Game from './Game'

export default class Player {
    public game!: Game

    /** Sets taken from the Game. */
    public readonly sets: Set.Cards[] = []

    /** Whether not timed out from taking sets. */
    private banned = false

    /** How long the user will be blocked for after a wrong attempt */
    public timeout!: number

    /** Number of collected Sets. */
    public get score(): number {
        return this.sets.length
    }

    public get isBanned(): boolean {
        return this.banned
    }

    /**
     * If possible, move a set from the market to a player.
     * If not, ban the player from taking any sets for `this.timeout`
     * @returns true iff a set was taken.
     */
    public takeSet(...indexs: Set.Indexs): boolean {
        if (!this.banned) {
            if (this.game.checkSet(...indexs)) {
                const set = this.game.removeSet(...indexs)
                this.sets.push(set)
                this.game.emit(Events.marketGrab, set)
                return true
            } else if (this.timeout) {
                setTimeout(() => {
                    this.banned = false
                    this.game.emit(Events.playerUnbanned, this)
                }, this.timeout)

                this.banned = true
                this.game.emit(Events.playerBanned, {player: this, timeout: this.timeout})
            }
        }
        return false
    }
}
