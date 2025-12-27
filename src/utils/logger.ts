import PKG from '../../package.json'

/**
 * 日志类
 * @description 日志类，用于记录日志
 * @example
 * const logger = new Logger('MyApp', 'UserModule')
 * logger.info('login', '用户登录成功')
 */
export class Logger {
  protected names: string[]

  /**
   * 构造函数
   * @param names 名称列表
   */
  constructor(...names: string[]) {
    this.names = names.filter(name => name !== '')
  }

  get trace() {
    return console.trace.bind(console, ...this.formatNames())
  }

  get debug() {
    return console.debug.bind(console, ...this.formatNames())
  }

  get info() {
    return console.info.bind(console, ...this.formatNames())
  }

  get log() {
    return console.log.bind(console, ...this.formatNames())
  }

  get warn() {
    return console.warn.bind(console, ...this.formatNames())
  }

  get error() {
    return console.error.bind(console, ...this.formatNames())
  }

  /**
   * 创建子日志实例
   * @param names 子日志名称
   * @returns 子日志实例
   */
  sub(...names: string[]): Logger {
    return new Logger(...this.names, ...names)
  }

  private formatNames(): string[] {
    const names = this.names
    const [firstName, ...restNamse] = names
    return [
      `[${firstName}] ${restNamse.map(name => `[${name}]`).join(' ')}`,
    ]
  }
}

/**
 * 应用日志
 */
export class AppLogger extends Logger {
  constructor(...names: string[]) {
    super(PKG.name, ...names)
  }
}

/**
 * 应用日志实例
 */
export const appLogger = new AppLogger()
