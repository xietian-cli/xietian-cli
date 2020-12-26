import { Option, RegisterProvider } from 'func'
import pkg from '../../package.json'
import boxen, { BorderStyle } from "boxen";
import chalk from 'chalk';
@Option({
  name: 'help',
  alias: 'h',
  description: 'help',
})
export class Help {
  constructor(regs: RegisterProvider) {
    const welcome = `欢迎使用 ${chalk.magenta(pkg.name)}\nWelcome to ${chalk.magenta(pkg.name)}\n${chalk.magenta(pkg.name)}へ、ようこそ`
    console.log(boxen(welcome, {padding: 1, borderStyle: BorderStyle.Round, borderColor: 'magenta'}));

    console.log('')

    regs.commands.forEach(data => {
      console.log(`  ${data.name} \<command\>${this.showDesc(data.description)}`)
    })

    console.log('')

    regs.options.forEach(data => {
      const alias = data.alias ? ` -${data.alias}` : ''
      console.log(`  --${data.name}${alias} \<option\>${this.showDesc(data.description)}`)
    })

    console.log('')
  }

  private showDesc(desc: string): string {
    return desc ? ` --  ${desc}` : ''
  }
}
