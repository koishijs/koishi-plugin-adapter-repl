import { Bot, Context, h, Schema } from 'koishi'
import ReplAdapter from './adapter'

class ReplBot extends Bot {
  hidden = true

  constructor(ctx: Context, config: ReplBot.Config) {
    super(ctx, config as any)
    this.platform = 'repl'
    this.selfId = 'koishi'
    ctx.plugin(ReplAdapter, this)

    if (config.replAsAdmin) {
      ctx.using(['database'], () => {
        ctx.database.setUser('repl', 'repl', { authority: Date.now() })
      })
    }
  }

  // TODO: 应该处理 segment 里面的特殊元素，例如 <execute>
  //       下亿个版本再说吧
  private botSay(content: h.Fragment) {
    let botName = this.ctx.root.config.nickname || 'BOT'
    if (Array.isArray(botName)) botName = botName[0]
    console.info(`[REPL] ${botName}`, '<', content.toString())
  }

  async sendPrivateMessage(userId: string, content: h.Fragment) {
    this.botSay(content)
    return []
  }

  async sendMessage(channelId: string, content: h.Fragment, guildId?: string) {
    this.botSay(content)
    return []
  }
}

namespace ReplBot {
  export interface Config {
    replAsAdmin?: boolean
  }
  export const Config: Schema<Config> = Schema.object({
    replAsAdmin: Schema.boolean().description('将终端作为超级管理员'),
  })
}

export default ReplBot
