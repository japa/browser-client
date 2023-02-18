/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { getLauncherOptions } from '../../src/plugin/get_launcher_options'

test.group('Launcher options', () => {
  test('get launcher options without CLI flags', ({ assert }) => {
    assert.deepEqual(
      getLauncherOptions({
        files: [],
      }),
      {
        headless: true,
        slowMo: undefined,
        devtools: false,
      }
    )
  })

  test('parse headed flag', ({ assert }) => {
    assert.deepEqual(
      getLauncherOptions({
        files: [],
        cliArgs: {
          headed: true,
        },
      }),
      {
        headless: false,
        slowMo: undefined,
        devtools: false,
      }
    )
  })

  test('parse slow flag', ({ assert }) => {
    assert.deepEqual(
      getLauncherOptions({
        files: [],
        cliArgs: {
          headed: true,
          slow: true,
        },
      }),
      {
        headless: false,
        slowMo: 100,
        devtools: false,
      }
    )
  })

  test('parse slow flag numeric value', ({ assert }) => {
    assert.deepEqual(
      getLauncherOptions({
        files: [],
        cliArgs: {
          headed: true,
          slow: '200',
        },
      }),
      {
        headless: false,
        slowMo: 200,
        devtools: false,
      }
    )
  })

  test('parse slow flag invalid value', ({ assert }) => {
    assert.deepEqual(
      getLauncherOptions({
        files: [],
        cliArgs: {
          headed: true,
          slow: 'foo',
        },
      }),
      {
        headless: false,
        slowMo: undefined,
        devtools: false,
      }
    )
  })

  test('parse devtools flag', ({ assert }) => {
    assert.deepEqual(
      getLauncherOptions({
        files: [],
        cliArgs: {
          headed: true,
          slow: 'foo',
          devtools: true,
        },
      }),
      {
        headless: false,
        slowMo: undefined,
        devtools: true,
      }
    )
  })
})
