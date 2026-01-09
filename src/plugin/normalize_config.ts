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
 * Default browser launchers that can be selected using the '--browser' CLI flag.
 * Supports chromium, firefox, and webkit.
 */
const DEFAULT_LAUNCHERS: Record<string, PluginConfig['launcher']> = {
  chromium: (launcherOptions) => chromium.launch(launcherOptions),
  firefox: (launcherOptions) => firefox.launch(launcherOptions),
  webkit: (launcherOptions) => webkit.launch(launcherOptions),
}

/**
 * Default configuration for assertions added to the page object.
 * These control the retry behavior for all assertion methods.
 */
export const DEFAULT_ASSERTIONS_CONFIG: Required<NonNullable<PluginConfig['assertions']>> = {
  /**
   * Maximum time to wait for assertions (5 seconds)
   */
  timeout: 5000,

  /**
   * Intervals to wait between retries (progressive backoff)
   */
  pollIntervals: [100, 250, 500, 1000],
}

/**
 * Normalizes and merges the user-defined config with CLI arguments
 * and default values.
 *
 * @param cliArgs - CLI arguments from Japa test runner
 * @param config - User-provided plugin configuration
 *
 * @example
 * ```ts
 * // With CLI args: --trace=onError --browser=firefox
 * const normalized = normalizeConfig(cliArgs, userConfig)
 * // Tracing will be enabled with event 'onError'
 * // Firefox will be used as the browser
 * ```
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
