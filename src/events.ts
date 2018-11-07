import Player from './Player'
import {Set} from './Card'

export const enum Events {
    start,
    finish,
    playerBanned,
    playerUnbanned,
    playerAdded,
    marketFilled,
    marketGrab,
}

export interface EventMap {
    [Events.start]: void,
    [Events.finish]: void,
    [Events.playerBanned]: {player: Player, timeout: number},
    [Events.playerUnbanned]: Player,
    [Events.playerAdded]: Player,
    [Events.marketFilled]: void,
    [Events.marketGrab]: Set.Cards
}
