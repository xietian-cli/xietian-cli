import { CommandMajor, RegisterProvider } from 'func'
import { Help } from '../options'
@CommandMajor()
export class Major {
  constructor(regs: RegisterProvider) {
    new Help(regs)
  }
}
