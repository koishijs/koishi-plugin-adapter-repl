import { Adapter, Bot, Context, h, Schema, SendOptions } from 'koishi'
import { EOL } from 'os'
import { createInterface, Interface } from 'readline'

declare module 'koishi' {
  interface Context {
    repl: ReplAdapter
  }
}

Context.service('repl')

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export class ReplBot extends Bot {
  hidden = true

  constructor (ctx: Context, config: Config) {
    super(ctx, config)
    ctx.plugin(ReplAdapter, this)
  }

  private write(content: h.Fragment) {
    process.stdout.write('\x08\x08< ')
    process.stdout.write(h('', content).toString(true))
    process.stdout.write(EOL)
    process.stdout.write('> ')
  }

  async sendPrivateMessage(userId: string, content: h.Fragment) {
    this.write(content)
    return []
  }

  async sendMessage(channelId: string, content: h.Fragment, guildId?: string, options?: SendOptions) {
    this.write(content)
    return []
  }
}

export class ReplAdapter extends Adapter.Server<ReplBot> {
  rl: Interface

  constructor(private ctx: Context, bot: ReplBot) {
    super()
    ctx.repl = this
    this.rl = createInterface({
      input: process.stdin,
      // output: process.stdout,
    })
  }

  async start() {
    process.stdout.write('> ')
    this.rl.on('line', (line) => {
      process.stdout.write('> ')
      const session = this.bots[0].session({
        type: 'message',
        subtype: 'private',
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
    this.ctx.repl = null
    this.rl.close()
  }
}

export default ReplBot
