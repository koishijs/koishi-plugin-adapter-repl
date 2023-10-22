import { Adapter, Context } from 'koishi'
import ansi from 'ansi-escapes'
import intercept from 'intercept-stdout'
import readline from 'node:readline'
import ReplBot from './bot'

export default class ReplAdapter<C extends Context = Context> extends Adapter<C, ReplBot<C>> {
  PROMPT_PREFIX = '> '

  readonly rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  async connect(bot: ReplBot<C>) {
    this.write(this.linePrefixed)

    // 拦截输出，确保用户输入行被置于最后一行
    intercept((text) => {
      const trimmedText = text.trim()
      const cmdStr = this.linePrefixed

      // 如果输出是ansi控制字符/回车键，不做特殊处理
      if ((trimmedText.startsWith('\u001B[') || trimmedText === '\n') && trimmedText !== cmdStr) {
        return
      }

      // readline会自己打印一次按键，如果用户输入的内容与按键一致，不要重复打印
      if (text === this.line[this.line.length - 1]) {
        return ''
      }

      // 清除用户输入行，重置光标到行首，打印最新输出，还原用户输入
      this.write(ansi.cursorLeft + ansi.eraseLine + trimmedText + '\n' + cmdStr)

      return ''
    })

    // 用户提交输入
    this.rl.on('line', (line) => {
      this.write(ansi.cursorLeft + ansi.cursorPrevLine + ansi.eraseDown)
      console.info(`[REPL] YOU`, '>', line)
      const session = bot.session()
      session.type = 'message'
      session.isDirect = true
      session.userId = 'repl'
      session.channelId = 'repl'
      session.content = line
      bot.dispatch(session)
    })

    // 检查按键按下的情况
    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'backspace') {
        if (this.line.length <= 0) return
        process.stdout.write(ansi.cursorLeft + ansi.cursorPrevLine + ansi.eraseDown + this.linePrefixed)
      } else if (key.ctrl && key.name === 'c') {
        this.write(ansi.cursorLeft + ansi.cursorNextLine + '\n\nBye~\n\n')
        process.exit(0)
      } else if (!key.ctrl && !key.meta && key.name !== 'enter' && key.name !== 'return') {
        process.stdout.write(ansi.eraseEndLine + str)
      }
    })
  }

  async disconnect() {
    this.rl.close()
  }

  write(content: string) {
    return process.stdout.write(content)
  }

  get line() {
    return this.rl.line
  }

  get linePrefixed() {
    return `${this.PROMPT_PREFIX}${this.line}`
  }
}
