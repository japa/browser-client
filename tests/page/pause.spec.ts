/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import sinon from 'sinon'
import { test } from '@japa/runner'
import { chromium } from 'playwright'

import { addPauseMethods } from '../../src/decorators/pause.js'

test.group('Page | pauseIf', () => {
  test('pause if condition is true', async ({ assert, cleanup }) => {
    const browser = await chromium.launch()
    cleanup(() => browser.close())

    const page = await browser.newPage()
    addPauseMethods.page(page)

    const pause = sinon.spy(page, 'pause')
    await page.pauseIf(true)

    assert.isTrue(pause.calledOnce)
  })

  test('do not pause if condition is false', async ({ assert, cleanup }) => {
    const browser = await chromium.launch()
    cleanup(() => browser.close())

    const page = await browser.newPage()
    addPauseMethods.page(page)

    const pause = sinon.spy(page, 'pause')
    await page.pauseIf(false)

    assert.isFalse(pause.calledOnce)
  })
})

test.group('Page | pauseUnless', () => {
  test('pause if condition is false', async ({ assert, cleanup }) => {
    const browser = await chromium.launch()
    cleanup(() => browser.close())

    const page = await browser.newPage()
    addPauseMethods.page(page)

    const pause = sinon.spy(page, 'pause')
    await page.pauseUnless(false)

    assert.isTrue(pause.calledOnce)
  })

  test('do not pause if condition is true', async ({ assert, cleanup }) => {
    const browser = await chromium.launch()
    cleanup(() => browser.close())

    const page = await browser.newPage()
    addPauseMethods.page(page)

    const pause = sinon.spy(page, 'pause')
    await page.pauseUnless(true)

    assert.isFalse(pause.calledOnce)
  })
})
