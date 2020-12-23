import { CommandArgsProvider, CommandMissing } from 'func'
const chalk = require('chalk')
const log = console.log
@CommandMissing()
export class Missing {
  constructor(arg: CommandArgsProvider) {
    log(`command: ${chalk.green(arg.inputs[0])} ${chalk.yellow('not found')}`)
  }
}
