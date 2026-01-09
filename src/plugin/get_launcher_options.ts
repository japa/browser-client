/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { LaunchOptions } from 'playwright'
import type { CLIArgs } from '@japa/runner/types'

import debug from '../debug.js'

/**
 * Creates Playwright launcher options from the test runner CLI arguments.
 * Supports flags like --headed, --slow, and --devtools.
 *
 * @param cliArgs - CLI arguments from Japa test runner
 *
 * @example
 * ```ts
 * // With CLI args: --headed --slow=500 --devtools
 * const options = getLauncherOptions(cliArgs)
 * // Returns: { headless: false, slowMo: 500, devtools: true }
 * ```
 */
export function getLauncherOptions(cliArgs: CLIArgs): LaunchOptions {
  const options = {
    headless: !cliArgs?.headed,
    slowMo: cliArgs?.slow === true ? 100 : Number(cliArgs?.slow) || undefined,
    devtools: !!cliArgs?.devtools,
  }

  debug('using launcher options %O', options)
  return options
}
