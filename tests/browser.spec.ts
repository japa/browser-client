/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { decorateBrowser } from '../src/browser'
import { chromium } from '../modules/playwright'
import { ServerFactory } from '../factories/server'

test.group('Browser', () => {
  test('open page', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
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

    await page.goto(server.url)
    assert.equal(await page.locator('body').innerText(), 'hello world')
  })

  test('decorate context', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      res.write(`X-Key=${req.headers['x-key']}`)
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [
      {
        context(ctx) {
          const originalNewPage: typeof ctx.newPage = ctx.newPage.bind(ctx)
          ctx.newPage = async function () {
            const page = await originalNewPage()
            page.setExtraHTTPHeaders({ 'X-Key': '22' })
            return page
          }
          return ctx
        },
      },
    ])

    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(server.url)
    assert.equal(await page.locator('body').innerText(), 'X-Key=22')
  })

  test('decorate page', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      res.write(`X-Key=${req.headers['x-key']}`)
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [
      {
        page(page) {
          page.route('**/**', (route, request) => {
            route.continue({
              headers: {
                ...request.headers(),
                ...{
                  'X-key': '33',
                },
              },
            })
          })
          return page
        },
      },
    ])

    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(server.url)
    assert.equal(await page.locator('body').innerText(), 'X-Key=33')
  })

  test('decorate page when newPage method is used', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      res.write(`X-Key=${req.headers['x-key']}`)
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [
      {
        page(page) {
          page.route('**/**', (route, request) => {
            route.continue({
              headers: {
                ...request.headers(),
                ...{
                  'X-key': '33',
                },
              },
            })
          })
          return page
        },
      },
    ])

    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    assert.equal(await page.locator('body').innerText(), 'X-Key=33')
  })

  test('decorate response', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write('hello world')
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [
      {
        response(response) {
          ;(response as any).isHTML = function () {
            return this.headers()['content-type'] === 'text/html'
          }
        },
      },
    ])

    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const context = await browser.newContext()
    const page = await context.newPage()

    const response = await page.goto(server.url)
    assert.isTrue((response as any).isHTML())
  })
})
