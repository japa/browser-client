/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { PluginFn, Suite } from '@japa/runner'

import type { PluginConfig } from './types'
import { decorateBrowser } from './browser.js'
import type { Browser as PlayWrightBrowser, BrowserContext } from '../modules/playwright'

/**
 * A proxy instance to raise meaningful error when browser
 * is accessed from a suite that is not running a real
 * browser.
 */
class BrowserProxy {
  constructor(suite: string) {
    return new Proxy(this, {
      get(property) {
        throw new Error(
          `Cannot access "browser.${property}". The browser is not configured to run in "${suite}" name`
        )
      },
    })
  }
}

/**
 * A proxy instance to raise meaningful error when browserContext
 * is accessed from a suite that is not running a real
 * browser.
 */
class BrowserContextProxy {
  constructor(suite: string) {
    return new Proxy(this, {
      get(property) {
        throw new Error(
          `Cannot access "browserContext.${property}". The browser is not configured to run in "${suite}" name`
        )
      },
    })
  }
}

/**
 * Extending types
 */
declare module '@japa/runner' {
  export interface TestContext {
    browser: PlayWrightBrowser
    browserContext: BrowserContext
  }
}

/**
 * Browser client plugin configures the lifecycle hooks to run
 * create playwright browser instances and browser context
 * when running a test or a suite.
 */
export function browserClient(config: PluginConfig) {
  const clientPlugin: PluginFn = function (_, runner, { TestContext }) {
    /**
     * Hooking into a suite to launch the browser and context
     */
    runner.onSuite((suite: Suite) => {
      if (!config.runInSuites || config.runInSuites.includes(suite.name)) {
        let browser: PlayWrightBrowser

        /**
         * Launching the browser on the suite setup and closing
         * after all tests of the suite are done.
         */
        suite.setup(async () => {
          browser = decorateBrowser(await config.laucher(), config.decorators || [])
          return () => browser.close()
        })

        /**
         * Create fresh context for all tests inside groups
         */
        suite.onGroup((group) => {
          group.each.setup(async ({ context }) => {
            context.browser = browser
            context.browserContext = await browser.newContext()
            return () => context.browserContext.close()
          })
        })

        /**
         * Create fresh context for all tests
         */
        suite.onTest((test) => {
          test.setup(async ({ context }) => {
            context.browser = browser
            context.browserContext = await browser.newContext()
            return () => context.browserContext.close()
          })
        })
      }
    })

    /**
     * Default getters to throw meaningful errors when browser is not
     * launched.
     */
    TestContext.getter(
      'browser',
      function () {
        return new BrowserProxy(this.test.options.meta.suite.name)
      },
      true
    )
    TestContext.getter(
      'browserContext',
      function () {
        return new BrowserContextProxy(this.test.options.meta.suite.name)
      },
      true
    )
  }

  return clientPlugin
}
