/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { PluginFn, Suite, type TestContext as TestContextClass } from '@japa/runner'

import '../decorators/pause'
import '../decorators/visit'

import type { PluginConfig } from '../types'
import { decorateBrowser } from '../browser'
import { traceActions } from './trace_actions'
import { normalizeConfig } from './normalize_config'
import { getLauncherOptions } from './get_launcher_options'
import { createContext, createFakeContext } from './create_context'
import type { BrowserContext, Browser as PlayWrightBrowser } from '../../modules/playwright'

/**
 * Extending types
 */
declare module '@japa/runner' {
  export interface TestContext {
    /**
     * Playwright browser
     */
    browser: PlayWrightBrowser

    /**
     * Playwright browser context
     */
    browserContext: BrowserContext

    /**
     * Opens a new page and visit the URL
     */
    visit: BrowserContext['visit']
  }
}

/**
 * Browser client plugin configures the lifecycle hooks to run
 * create playwright browser instances and browser context
 * when running a test or a suite.
 */
export function browserClient(config: PluginConfig) {
  const clientPlugin: PluginFn = function (runnerConfig, runner, { TestContext }) {
    /**
     * Since the macro will be destructured, we want to set the
     * value and update the scope to the current instance of
     * context
     */
    TestContext.created((context) => {
      context.visit = function (
        this: TestContextClass,
        ...args: Parameters<BrowserContext['visit']>
      ) {
        return this.browserContext.visit(...args)
      }.bind(context)
    })

    /**
     * Normalizing config
     */
    const normalizedConfig = normalizeConfig(runnerConfig, config)

    /**
     * Normalizing launch options
     */
    const launcherOptions = getLauncherOptions(runnerConfig)

    /**
     * Hooking into a suite to launch the browser and context
     */
    runner.onSuite((suite: Suite) => {
      const initiateBrowser = !config.runInSuites || config.runInSuites.includes(suite.name)
      let browser: PlayWrightBrowser

      /**
       * Launching the browser on the suite setup and closing
       * after all tests of the suite are done.
       */
      if (initiateBrowser) {
        suite.setup(async () => {
          browser = decorateBrowser(
            await normalizedConfig.launcher(launcherOptions),
            normalizedConfig.decorators
          )
          return () => browser.close()
        })
      }

      /**
       * Hooks for all the tests inside a group
       */
      suite.onGroup((group) => {
        if (initiateBrowser) {
          group.each.setup((test) => createContext(browser, config, test))
          group.each.setup((test) => traceActions(config, test))
        } else {
          group.each.setup((test) => createFakeContext(test))
        }
      })

      /**
       * Hooks for all top level tests inside a suite
       */
      suite.onTest((test) => {
        if (initiateBrowser) {
          test.setup((self) => createContext(browser, config, self))
          test.setup((self) => traceActions(config, self))
        } else {
          test.setup((self) => createFakeContext(self))
        }
      })
    })
  }

  return clientPlugin
}
