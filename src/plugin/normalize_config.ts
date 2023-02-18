/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Config } from '@japa/runner'

import { PluginConfig } from '../types'
import { addPauseMethods } from '../decorators/page'
import { addVisitMethod } from '../decorators/context'
import { chromium, firefox, webkit } from '../../modules/playwright'

/**
 * Decorators bundled by default
 */
const BUNDLED_DECORATORS = [addVisitMethod, addPauseMethods]

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
    decorators: BUNDLED_DECORATORS.concat(config.decorators || []),
  }
}
