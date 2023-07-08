/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import type { CLIArgs } from '@japa/runner/types'
import { chromium, firefox, webkit } from 'playwright'

import type { PluginConfig } from '../types/main.js'

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
export function normalizeConfig(cliArgs: CLIArgs, config: PluginConfig) {
  const tracingEvent = cliArgs?.trace as string | undefined
  if (tracingEvent && !['onError', 'onTest'].includes(tracingEvent)) {
    throw new Error(
      `Invalid tracing event "${tracingEvent}". Use --trace="onTest" or --trace="onError"`
    )
  }

  /**
   * Enable tracing when tracing event is defined
   */
  if (tracingEvent) {
    config.tracing = Object.assign(
      config.tracing || {
        outputDirectory: join(process.cwd(), './'),
        cleanOutputDirectory: true,
      },
      {
        enabled: true,
        event: tracingEvent as 'onError' | 'onTest',
      }
    )
  }

  return {
    ...config,
    launcher:
      config.launcher ||
      (async (launcherOptions) => {
        const browser = cliArgs?.browser || 'chromium'
        const launcher = DEFAULT_LAUNCHERS[browser as keyof typeof DEFAULT_LAUNCHERS]

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
  }
}
