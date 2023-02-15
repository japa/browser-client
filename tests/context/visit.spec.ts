/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { BasePage } from '../../src/base_page'
import { chromium } from '../../modules/playwright'
import { decorateBrowser } from '../../src/browser'
import { ServerFactory } from '../../factories/server'
import { addVisitMethod } from '../../src/decorators/context'

test.group('Visit', () => {
  test('visit a url', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.write('hello world')
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addVisitMethod])
    cleanup(async () => {
      await browser.close()
      await server.close()
    })

    const context = await browser.newContext()
    const page = await context.visit(server.url)
    assert.equal(await page.locator('body').innerText(), 'hello world')
  })

  test('visit a page model', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.write('hello world')
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addVisitMethod])
    cleanup(async () => {
      await browser.close()
      await server.close()
    })

    class HomePage extends BasePage {
      url = server.url

      async assertBody() {
        assert.equal(await this.parent.locator('body').innerText(), 'hello world')
      }
    }

    const context = await browser.newContext()
    const page = await context.visit(HomePage)
    await page.assertBody()
  })

  test('get access to page model inside callback', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.write('hello world')
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addVisitMethod])
    cleanup(async () => {
      await browser.close()
      await server.close()
    })

    class HomePage extends BasePage {
      url = server.url

      async assertBody() {
        assert.equal(await this.parent.locator('body').innerText(), 'hello world')
      }
    }

    const context = await browser.newContext()
    await context.visit(HomePage, (page) => page.assertBody())
  })
})
