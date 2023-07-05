/*
 * @japa/browser-client
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  Page,
  Browser,
  Response,
  LaunchOptions,
  BrowserContext,
  BrowserContextOptions,
} from 'playwright'

/**
 * Decorators are used to extend the `page`, `context`, and the
 * `response` objects. Since Playwright does not exports classes,
 * we cannot use inheritance and have to decorate objects
 * directly
 */
export type Decorator = {
  page?: (page: Page, context: BrowserContext) => void
  context?: (context: BrowserContext) => void
  response?: (response: Response) => void
}

/**
 * Options for the visit method
 */
export type VisitOptions = Exclude<Parameters<Page['goto']>[1], undefined>

/**
 * Configuration accepted by the plugin.
 */
export type PluginConfig = {
  /**
   * Control automatic tracing of tests
   */
  tracing?: {
    enabled: boolean
    event: 'onError' | 'onTest'
    cleanOutputDirectory: boolean
    outputDirectory: string
  }

  /**
   * Options for the context created for every test
   */
  contextOptions?: BrowserContextOptions

  /**
   * Lazily launch a browser.
   */
  launcher?: (config: Pick<LaunchOptions, 'headless' | 'slowMo' | 'devtools'>) => Promise<Browser>

  /**
   * An optional array of suites that will be interacting with the
   * browser. It is recommended to configure this plugin for
   * specific suite, otherwise a browser instance will be
   * created for all tests across all the suites.
   */
  runInSuites?: string[]
}
