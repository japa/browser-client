/*
 * @japa/browser-client
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import cookie from 'cookie'
import { test } from '@japa/runner'
import { chromium } from 'playwright'

import { ServerFactory } from '../../factories/server.js'
import { decorateBrowser } from '../../src/decorate_browser.js'

test.group('Browser context', () => {
  test('get response cookies reflected on context', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('set-cookie', cookie.serialize('user_id', '1'))
      res.write('hello world')
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [])

    cleanup(async () => {
      await browser.close()
      await server.close()
    })

    const context = await browser.newContext()
    const page = await context.newPage()
    assert.deepEqual(await context.cookies(), [])

    await page.goto(server.url)

    const cookies = await context.cookies()
    assert.lengthOf(cookies, 1)
    assert.equal(cookies[0].value, '1')
    assert.equal(cookies[0].name, 'user_id')
  })
})
