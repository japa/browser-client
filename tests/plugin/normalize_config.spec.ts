/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { normalizeConfig } from '../../src/plugin/normalize_config'

test.group('Nornalize config', () => {
  test('launch chromium browser', async ({ assert, cleanup }) => {
    const browser = await normalizeConfig(
      {
        cliArgs: {},
        files: [],
      },
      {}
    ).launcher({})

    cleanup(() => browser.close())
    assert.equal(browser.browserType().name(), 'chromium')
  })

  test('launch firefox browser', async ({ assert, cleanup }) => {
    const browser = await normalizeConfig(
      {
        cliArgs: {
          browser: 'firefox',
        },
        files: [],
      },
      {}
    ).launcher({})

    cleanup(() => browser.close())
    assert.equal(browser.browserType().name(), 'firefox')
  })

  test('launch webkit browser', async ({ assert, cleanup }) => {
    const browser = await normalizeConfig(
      {
        cliArgs: {
          browser: 'webkit',
        },
        files: [],
      },
      {}
    ).launcher({})

    cleanup(() => browser.close())
    assert.equal(browser.browserType().name(), 'webkit')
  })

  test('raise error when invalid browser is mentioned', async ({ assert }) => {
    await assert.rejects(
      () =>
        normalizeConfig(
          {
            cliArgs: {
              browser: 'chrome',
            },
            files: [],
          },
          {}
        ).launcher({}),
      'Invalid browser "chrome". Allowed values are chromium, firefox, webkit'
    )
  })

  test('enable tracing when --trace flag is used', async ({ assert }) => {
    const config = normalizeConfig(
      {
        cliArgs: {
          browser: 'webkit',
          trace: 'onError',
        },
        files: [],
      },
      {}
    )

    assert.deepEqual(config.tracing, {
      enabled: true,
      event: 'onError',
      cleanOutputDirectory: true,
      outputDirectory: './',
    })
  })

  test('overwrite inline tracing config when --trace flag is mentioned', async ({ assert }) => {
    const config = normalizeConfig(
      {
        cliArgs: {
          browser: 'webkit',
          trace: 'onTest',
        },
        files: [],
      },
      {
        tracing: {
          enabled: false,
          event: 'onError',
          cleanOutputDirectory: true,
          outputDirectory: './foo',
        },
      }
    )

    assert.deepEqual(config.tracing, {
      cleanOutputDirectory: true,
      enabled: true,
      event: 'onTest',
      outputDirectory: './foo',
    })
  })

  test('throw error when tracing event is invalid', async ({ assert }) => {
    assert.throws(
      () =>
        normalizeConfig(
          {
            cliArgs: {
              browser: 'webkit',
              trace: 'yes',
            },
            files: [],
          },
          {
            tracing: {
              enabled: false,
              event: 'onError',
              cleanOutputDirectory: true,
              outputDirectory: './foo',
            },
          }
        ),
      'Invalid tracing event "yes". Use --trace="onTest" or --trace="onError"'
    )
  })
})
