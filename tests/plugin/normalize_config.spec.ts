/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { addUseMethod } from '../../src/decorators/use'
import { addVisitMethod } from '../../src/decorators/visit'
import { addPauseMethods } from '../../src/decorators/pause'
import { addAssertions } from '../../src/decorators/assertions'
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

  test('merge bundled decorator with user defined decorators', async ({ assert }) => {
    function customDecorator() {}
    const config = normalizeConfig(
      {
        files: [],
      },
      {
        decorators: [
          {
            page: customDecorator,
          },
        ],
      }
    )

    assert.deepEqual(config.decorators, [
      addVisitMethod,
      addPauseMethods,
      addUseMethod,
      addAssertions,
      { page: customDecorator },
    ])
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
