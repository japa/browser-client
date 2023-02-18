/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Config } from '@japa/runner'
import { LaunchOptions } from 'playwright'

/**
 * Creates launcher options from the tests runner config
 */
export function getLauncherOptions(runnerConfig: Config): LaunchOptions {
  return {
    headless: !runnerConfig.cliArgs?.headed,
    slowMo:
      runnerConfig.cliArgs?.slow === true ? 100 : Number(runnerConfig.cliArgs?.slow) || undefined,
    devtools: !!runnerConfig.cliArgs?.devtools,
  }
}
