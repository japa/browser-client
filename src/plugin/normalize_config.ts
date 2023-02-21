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

import { PluginConfig } from '../types'

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
  const tracingEvent = runnerConfig.cliArgs?.trace
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
        outputDirectory: './',
        cleanOutputDirectory: true,
      },
      {
        enabled: true,
        event: tracingEvent,
      }
    )
  }

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
  }
}
