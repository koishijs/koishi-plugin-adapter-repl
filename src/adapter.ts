import { Adapter } from 'koishi'
import { createInterface } from 'readline/promises'
import ReplBot from './bot'

export default class ReplAdapter extends Adapter.Server<ReplBot> {
  rl = createInterface({
    input: process.stdin,
    // output: process.stdout,
  })

  async start() {
    process.stdout.write('> ')
    this.rl.on('line', (line) => {
      process.stdout.write('> ')
      const session = this.bots[0].session({
        type: 'message',
        subtype: 'private',
        isDirect: true,
        platform: 'repl',
        userId: 'repl',
        channelId: 'repl',
        content: line,
        author: {
          username: 'repl',
          userId: 'repl',
        },
      })
      this.bots[0].dispatch(session)
    })
  }

  async stop() {
    this.rl.close()
  }
}
