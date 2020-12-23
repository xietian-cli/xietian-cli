import { Command, CommandArgsProvider } from 'func'
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const ora = require('ora')
const Inquirer = require('inquirer')
const shell = require('shelljs')
const { promisify } = require('util')
let downLoadGit = require('download-git-repo')
let ncp = require('ncp')
downLoadGit = promisify(downLoadGit)
ncp = promisify(ncp)

// 缓存目录
const CACHE_DIR = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.xietian_cli_cache`
// 组织名称
const ORG = "xietian-cli";
@Command({
  name: 'create',
})
export class Create {

  constructor(private arg: CommandArgsProvider) {
    this.init()
  }

  private async fetchRepoList(): Promise<any[]> {
    const { data } = await axios.get(`https://api.github.com/orgs/${ORG}/repos`)
    return data
  }

  async download(repo: string): Promise<string> {
    const api = `${ORG}/${repo}`
    const dest = `${CACHE_DIR}/${repo}`
    await downLoadGit(api, dest)
    return dest
  }

  private useLoading(fn: Function, message: string): Function {
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

  private async init(): Promise<void> {
    let repos = await this.useLoading(this.fetchRepoList, '获取仓库列表')();

    // xietian-cli不是模板，需要过滤
    repos = repos.filter((repo: any) => repo.name !== "xietian-cli")

    const questions = new Questions(repos).create()
    const res: InquirerResult = await Inquirer.prompt(questions);

    const dest = await this.useLoading(this.download, '下载模板')(res.template);

    // 将下载的文件拷贝到当前执行命令的目录下
    await ncp(dest, path.join(path.resolve(), res.name))
    shell.rm('-rf', CACHE_DIR)

    // 修改package.json
    const packagejsonPath = path.resolve(process.cwd(), `./${res.name}/package.json`);
    const packageJson = Object.assign(
      require(packagejsonPath),
      {
        name: res.name,
        author: res.author,
        description: res.description
      }
    );

    fs.writeFileSync(packagejsonPath, JSON.stringify(packageJson, null, 2));

    let readmePath = `./${res.name}/README.md`;
    let data = fs.readFileSync(readmePath)
      .toString()
      .replace('PROJECT_NAME', res.name)
      .replace('DESCRIPTION', res.description);
    fs.writeFileSync(readmePath, data);
  }
}

interface InquirerResult {
  template: string;
  name: string;
  description: string;
  author: string;
}
class Questions {
  private repos: any[];
  constructor(repos: any[]) {
    this.repos = repos;
  }
  create() {
    return [
      {
        name: 'template',
        type: 'list',
        message: '请选择一个模板',
        choices: this.repos
      },
      {
        name: 'name',
        type: 'input',
        message: '项目名称',
        default() {
          return 'ts-rollup-starter';
        }
      },
      {
        name: 'description',
        type: 'input',
        message: '项目描述',
        default() {
          return 'A TypeScript library build with rollup';
        }
      },
      {
        name: 'author',
        type: 'input',
        message: '作者',
        default() {
          return 'Your Name <you@example.com>';
        }
      }
    ];
  }
}
