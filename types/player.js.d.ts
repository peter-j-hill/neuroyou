// player.js (the protocol Bunny's embedded player speaks) ships without types. Only what we use.
declare module 'player.js' {
  export class Player {
    constructor(iframe: HTMLIFrameElement)
    on(event: string, callback: (data?: unknown) => void): void
    off(event: string, callback?: (data?: unknown) => void): void
    play(): void
    pause(): void
    setCurrentTime(seconds: number): void
  }
  const playerjs: { Player: typeof Player }
  export default playerjs
}
