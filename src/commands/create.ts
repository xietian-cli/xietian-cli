import { Command, CommandArgsProvider } from 'func'
const path = require('path')
const axios = require('axios')
const ora = require('ora')
const Inquirer = require('inquirer')
const { promisify } = require('util')
let downLoadGit = require('download-git-repo')
let ncp = require('ncp')
downLoadGit = promisify(downLoadGit)
ncp = promisify(ncp)

// 下载目录
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`

@Command({
  name: 'create',
})
export class Create {
  constructor(private arg: CommandArgsProvider) {
    if(arg.inputs.length < 2) {
      console.error('请输入项目名称')
      return;
    }
    
    this.init(arg.inputs[1])
  }
  private async init(projectName: string): Promise<void> {
    const repos = await this.wrapFetchAddLoding(this.fetchRepoList, '获取仓库列表')();
    // 选择模板
    const { repo } = await Inquirer.prompt({
      name: 'repo',
      type: 'list',
      message: '请选择一个模板',
      choices: repos
    });
    const dest = await this.wrapFetchAddLoding(this.download, '下载模板')(repo);
    console.log(dest)

    // 将下载的文件拷贝到当前执行命令的目录下
    ncp(dest, path.join(path.resolve(), projectName))
  }
  async download(repo: string): Promise<string> {
    const api = `hl-cli/${repo}`
      const dest = `${downloadDirectory}/${repo}`
      await downLoadGit(api, dest)
      return dest
  }
  private async fetchRepoList() {
    const { data } = await axios.get('https://api.github.com/orgs/hl-cli/repos')
    return data
  }

  private wrapFetchAddLoding(fn: Function, message: string): Function {
    return async (...args) => {
      const spinner = ora(message)
      spinner.start()
      let res
      try {
        res = await fn(...args)
        spinner.succeed()
      } catch (e) {
        spinner.fail()
      }
      return res
      }
    }
}
