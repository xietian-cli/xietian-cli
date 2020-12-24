import { Command, CommandArgsProvider } from 'func'
const chalk = require('chalk')

@Command({
  name: 'draw',
})
export class Draw {
  constructor(args: CommandArgsProvider) {
    new Xmas();
  }
}

const DEFAULT_COLOR = true;
const DEFAULT_SIZE = 30;
const DECO_CANDIDATES = '          bug?';
const COLOR_CANDIDATES = [
  'blue',
  'cyan',
  'green',
  'magenta',
  'red',
  'white',
  'yellow'
];
class Xmas {
  constructor(opts = {}) {
    this.draw(opts)
  }

  draw(opts) {
    const size = this.getSizeOpt(opts);
    const hasColor = this.getColorOpt(opts);

    const xmas = Array(size).fill('')
      .map((_, i) => this.makeTree(i, size, hasColor))
      .filter(i => i.length > 0)
      .concat(this.makePot(size, hasColor))
      .join('\n')
      .replace(/^/, '\n')
      .replace(/^/gm, '    ');
    console.log(xmas);
  }

  getSizeOpt(opts) {
    if ('size' in opts) {
      if (typeof opts.size !== 'number') {
        opts.size = DEFAULT_SIZE;
      } else if (opts.size < DEFAULT_SIZE) {
        opts.size = DEFAULT_SIZE;
      }
    } else {
      opts.size = DEFAULT_SIZE;
    }
    return opts.size;
  }

  getColorOpt(opts) {
    if ('color' in opts) {
      if (typeof opts.color !== 'boolean') {
        opts.color = DEFAULT_COLOR;
      }
    } else {
      opts.color = DEFAULT_COLOR;
    }
    return opts.color;
  }

  makeTree(i, size, hasColor) {
    let line;
    switch (i) {
      case 0:
        line = this.makeLine(size, '*', 'green');
        return hasColor ? chalk.green(line) : line;
      case 1:
        line = this.makeLine(size, '_/ \\_', 'green');
        return hasColor ? chalk.green(line) : line;
      case 2:
        line = this.makeLine(size, '\\     /', 'green');
        return hasColor ? chalk.green(line) : line;
      case 3:
        line = this.makeLine(size, '/_\' \'_\\', 'green');
        return hasColor ? chalk.green(line) : line;
      default:
        return this.makeNthLine(i, size, hasColor);
    }
  }

  //  footer
  makePot(size, hasColor) {
    const i = Math.floor(size / 25) + 1;
    const line = this.makeLine(size, ['*', this.repeat(size - 2, '-'), '*']);
    return [
      hasColor ? chalk.magenta(line) : line,
      this.makeLine(size, ['[', this.repeat(7 * i, '_'), ']']),
      this.makeLine(size, ['\\', this.repeat(5 * i, '_'), '/']),
      ''
    ];
  }

  makeLine(max, body, color = "magenta") {
    if (typeof body.join === 'function') {
      body = body.join('');
    }
    const offset = Array((max - body.length) >> 1).fill(' ').join('');

    return chalk[color](offset + body);
  }

  makeNthLine(i, size, hasColor) {
    const space = i - 2;
    if (space % 2 === 0) {
      return '';
    }

    const line = this.makeLine(size, ['/', this.repeat(space, ' '), '\\']);

    return line.split('')
      .map((c, i) => {
        if (c === '/' || c === '\\') {
          return hasColor ? chalk.magenta(c) : c;

        } else if (c === ' ' && line.indexOf('/') < i) {
          return this.randomDeco(hasColor);
        }
        return c;
      })
      .join('');
  }

  randomDeco(hasColor) {
    const i = this.random(DECO_CANDIDATES.length);
    const c = DECO_CANDIDATES[i];
    return hasColor ? chalk[this.randomColor()](c) : c;
  }

  repeat(size, c) {
    return Array(size).fill(c || ' ').join('');
  }

  random(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  randomColor() {
    return COLOR_CANDIDATES[this.random(COLOR_CANDIDATES.length)];
  }
}
