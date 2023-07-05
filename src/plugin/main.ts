/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Suite } from '@japa/runner/core'
import { PluginFn } from '@japa/runner/types'
import type { Browser as PlayWrightBrowser } from 'playwright'

import debug from '../debug.js'
import type { PluginConfig } from '../types/main.js'
import { normalizeConfig } from './normalize_config.js'
import { decorateBrowser } from '../decorate_browser.js'
import { getLauncherOptions } from './get_launcher_options.js'
import { decoratorsCollection } from '../decorators/collection.js'
import { cleanTracesHook, traceActionsHook } from './hooks/trace_actions.js'
import { createContextHook, createFakeContextHook } from './hooks/create_context.js'

/**
 * Browser client plugin configures the lifecycle hooks to
 * create playwright browser instances and browser context
 * when running a test or a suite.
 */
export function browserClient(config: PluginConfig) {
  const clientPlugin: PluginFn = function (japa) {
    const normalizedConfig = normalizeConfig(japa.cliArgs, config)
    const launcherOptions = getLauncherOptions(japa.cliArgs)

    /**
     * Hooking into a suite to launch the browser and context
     */
    japa.runner.onSuite((suite: Suite) => {
      let browser: PlayWrightBrowser

      const shouldInitiateBrowser = !config.runInSuites || config.runInSuites.includes(suite.name)
      const isTracingEnabled = normalizedConfig.tracing && normalizedConfig.tracing.enabled
      const shouldCleanOutputDirectory =
        isTracingEnabled &&
        normalizedConfig.tracing!.cleanOutputDirectory &&
        normalizedConfig.tracing!.outputDirectory

      /**
       * Launching the browser on the suite setup and closing
       * after all tests of the suite are done.
       */
      if (shouldInitiateBrowser) {
        /**
         * Clean output directory before running suite tests
         */
        if (shouldCleanOutputDirectory) {
          suite.setup(() => cleanTracesHook(suite, normalizedConfig.tracing!.outputDirectory))
        }

        suite.setup(async () => {
          debug('initiating browser for suite "%s"', suite.name)
          browser = decorateBrowser(
            await normalizedConfig.launcher(launcherOptions),
            decoratorsCollection.toList()
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
        if (shouldInitiateBrowser) {
          group.each.setup((test) => createContextHook(browser, config, test))
          if (isTracingEnabled) {
            group.each.setup((test) => traceActionsHook(normalizedConfig.tracing!, test))
          }
        } else {
          group.each.setup((test) => createFakeContextHook(test))
        }
      })

      /**
       * Hooks for all top level tests inside a suite
       */
      suite.onTest((test) => {
        if (shouldInitiateBrowser) {
          test.setup((self) => createContextHook(browser, config, self))
          if (isTracingEnabled) {
            test.setup((self) => traceActionsHook(normalizedConfig.tracing!, self))
          }
        } else {
          test.setup((self) => createFakeContextHook(self))
        }
      })
    })
  }

  return clientPlugin
}
