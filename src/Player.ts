import { Set } from './Card'
import { Events } from './events'
import Game from './Game'
import { close } from 'inspector';
import { SSL_OP_LEGACY_SERVER_CONNECT } from 'constants';

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

    /** If possible, move a set from the market to a player. */
    public takeSet(...indexs: Set.Indexs): boolean {
        if (!this.banned && this.game.checkSet(...indexs)) {
            const set = this.game.removeSet(...indexs)
            this.sets.push(set)
            this.game.emit(Events.marketGrab, set)
            return true
        }

        this.ban()
        return false
    }

    /** Bans the player from taking any sets. */
    private ban() {
        if (this.banned || !this.timeout) // no need to ban
            return

        setTimeout(() => {
            this.banned = false
            this.game.emit(Events.playerUnbanned, this)
        }, this.timeout)

        this.banned = true
        this.game.emit(Events.playerBanned, {player: this, timeout: this.timeout})
    }
}
