/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Config } from '@japa/runner'
import { chromium, firefox, webkit } from 'playwright'

import { addUseMethod } from '../decorators/use'
import { Decorator, PluginConfig } from '../types'
import { addVisitMethod } from '../decorators/visit'
import { addPauseMethods } from '../decorators/pause'
import { addAssertions } from '../decorators/assertions'

/**
 * Decorators bundled by default
 */
const BUNDLED_DECORATORS = [addVisitMethod, addPauseMethods, addUseMethod, addAssertions]

/**
 * Default launchers that can be selected using the '--browser' flag
 */
const DEFAULT_LAUNCHERS: Record<string, PluginConfig['launcher']> = {
  chromium: (launcherOptions) => chromium.launch(launcherOptions),
  firefox: (launcherOptions) => firefox.launch(launcherOptions),
  webkit: (launcherOptions) => webkit.launch(launcherOptions),
}

/**
 * Normalizes the user defined config
 */
export function normalizeConfig(runnerConfig: Config, config: PluginConfig) {
  return {
    ...config,
    launcher:
      config.launcher ||
      (async (launcherOptions) => {
        const browser = runnerConfig.cliArgs?.browser || 'chromium'
        const launcher = DEFAULT_LAUNCHERS[browser]

        /**
         * Invalid browser specified via "--browser" flag
         */
        if (!launcher) {
          throw new Error(
            `Invalid browser "${browser}". Allowed values are ${Object.keys(DEFAULT_LAUNCHERS).join(
              ', '
            )}`
          )
        }

        return launcher(launcherOptions)
      }),
    decorators: ([] as Decorator[]).concat(BUNDLED_DECORATORS).concat(config.decorators || []),
  }
}
