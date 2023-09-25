/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { chromium } from 'playwright'
import { test } from '@japa/runner'
import { Test, Emitter, Refiner, TestContext } from '@japa/runner/core'

import { decorateBrowser } from '../../index.js'
import { addVisitMethod } from '../../src/decorators/visit.js'
import { createContextHook, createFakeContextHook } from '../../src/plugin/hooks/create_context.js'

test.group('Create context', () => {
  test('create browser context and assign it to test context', async ({ assert, cleanup }) => {
    const browser = decorateBrowser(await chromium.launch(), [addVisitMethod])
    cleanup(() => browser.close())

    const emitter = new Emitter()
    const refiner = new Refiner()

    const createTestContext = (self: Test) => new TestContext(self)
    const t = new Test('a sample test', createTestContext, emitter, refiner)
    t.context = createTestContext(t)

    await createContextHook(browser, {}, t)

    assert.isDefined(t.context.browserContext)
    assert.strictEqual(t.context.browser, browser)
  })

  test('assign fake context and browser to test context', async ({ assert, cleanup }) => {
    const browser = await chromium.launch()
    cleanup(() => browser.close())

    const emitter = new Emitter()
    const refiner = new Refiner()

    const createTestContext = (self: Test) => new TestContext(self)
    const t = new Test('a sample test', createTestContext, emitter, refiner)
    t.context = createTestContext(t)
    t.options.meta = {
      suite: {
        name: 'unit',
      },
    }

    createFakeContextHook(t)
    assert.throws(
      () => t.context!.browser.newPage(),
      'Cannot access "browser.newPage". The browser is not configured to run for "unit" suite'
    )

    assert.throws(
      () => t.context!.browserContext.newPage(),
      'Cannot access "browserContext.newPage". The browser is not configured to run for "unit" suite'
    )
  })
})
