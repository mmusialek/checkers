import Phaser from 'phaser'

export const eventsCenter = new Phaser.Events.EventEmitter()

export enum EventTypes {
    gameOver = "gameOver"
}