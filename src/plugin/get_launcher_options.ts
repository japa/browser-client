/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { CLIArgs } from '@japa/runner/types'
import { LaunchOptions } from 'playwright'

import debug from '../debug.js'

/**
 * Creates launcher options from the tests runner config
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
