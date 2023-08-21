import { Adapter } from 'koishi'
import { createInterface } from 'readline/promises'
import ReplBot from './bot'

export default class ReplAdapter extends Adapter.Server<ReplBot> {
  rl = createInterface({
    input: process.stdin,
    // output: process.stdout,
  })

  async start(bot: ReplBot) {
    process.stdout.write('> ')
    this.rl.on('line', (line) => {
      process.stdout.write('> ')
      const session = bot.session({
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
      bot.dispatch(session)
    })
  }

  async stop() {
    this.rl.close()
  }
}
