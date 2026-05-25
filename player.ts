import { origo } from "./basic"
import { names } from "./names"
import { Vec2 } from "./vec"

export type Player = {
    id: string
    name: string
    health: number
    damage: number
    color: string
    radius: number
    speed: number
    pos: Vec2
    acc: Vec2
    ready?: boolean
}

export const localPlayer: Player = {
    id: '',
    name: names[Math.floor(Math.random() * names.length)],
    health: 100,
    damage: 20,
    color: "blue",
    radius: 20,
    speed: 0.5,
    pos: origo(),
    acc: origo(),
}

// circles contains physics objects rendered locally (just the local player for now)
export const circles: Player[] = [localPlayer]

// Remote players keyed by socket id
export const remotePlayers: Map<string, Player> = new Map()