/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs-extra'
import type { BrowserContext, Browser as PlayWrightBrowser } from 'playwright'
import { PluginFn } from '@japa/runner/types'
import { Suite, TestContext } from '@japa/runner/core'

import debug from '../debug.js'
import type { PluginConfig } from '../types.js'
import { decorateBrowser } from '../browser.js'
import { traceActions } from './trace_actions.js'
import { normalizeConfig } from './normalize_config.js'
import { getLauncherOptions } from './get_launcher_options.js'
import { decoratorsCollection } from '../decorators_collection.js'
import { createContext, createFakeContext } from './create_context.js'

/**
 * Extending types
 */
declare module '@japa/runner/core' {
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
  const clientPlugin: PluginFn = function (japa) {
    /**
     * Normalizing config
     */
    const normalizedConfig = normalizeConfig(japa.cliArgs, config)

    /**
     * Normalizing launch options
     */
    const launcherOptions = getLauncherOptions(japa.cliArgs)

    /**
     * Hooking into a suite to launch the browser and context
     */
    japa.runner.onSuite((suite: Suite) => {
      const initiateBrowser = !config.runInSuites || config.runInSuites.includes(suite.name)

      let browser: PlayWrightBrowser

      /**
       * Launching the browser on the suite setup and closing
       * after all tests of the suite are done.
       */
      if (initiateBrowser) {
        const tracing = normalizedConfig.tracing

        /**
         * Clean output directory before running suite tests
         */
        if (tracing && tracing.cleanOutputDirectory && tracing.outputDirectory) {
          suite.setup(() => fs.remove(tracing.outputDirectory!))
        }

        suite.setup(async () => {
          debug('initiating browser for suite "%s"', suite.name)
          browser = decorateBrowser(
            await normalizedConfig.launcher(launcherOptions),
            decoratorsCollection.toJSON()
          )

          return () => {
            debug('closing browser for suite "%s"', suite.name)
            return browser.close()
          }
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
