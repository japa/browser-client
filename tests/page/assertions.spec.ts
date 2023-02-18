/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { chromium } from 'playwright'

import { ServerFactory } from '../../factories/server'
import { addAssertions } from '../../src/decorators/assertions'

test.group('Assertions', () => {
  test('assert element to exist', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
         <p> Hello world </p>
         <p> Hi world </p>

         <h1 style="display: none"> Title </h1>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)
    await page.assertExists('p')
    await page.assertExists('h1')
    await assert.rejects(() => page.assertExists('span'), `expected 'span' element to exist`)
  })

  test('assert elements to have expected count', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
         <p> Hello world </p>
         <p> Hi world </p>

         <h1 style="display: none"> Title </h1>

         <ul>
          <li> Hello world </li>
          <li> Hi world </li>
          <li> Bye world </li>
         </ul>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)
    await page.assertElementsCount('p', 2)
    await page.assertElementsCount('h1', 1)
    await page.assertElementsCount('ul > li ', 3)
    await assert.rejects(
      () => page.assertElementsCount('span', 1),
      `expected 'span' to have 1 elements`
    )
  })

  test('assert page title', async ({ assert, cleanup }) => {
    assert.plan(1)

    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)
    await page.assertTitle('Hello world')
  })

  test('assert page title to include a substr', async ({ assert, cleanup }) => {
    assert.plan(1)

    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)
    await page.assertTitleContains('world')
  })

  test('assert page URL', async ({ assert, cleanup }) => {
    assert.plan(1)

    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(`${server.url}/foo/bar`)
    await page.assertUrl(`${server.url}/foo/bar`)
  })

  test('assert page URL with query string', async ({ assert, cleanup }) => {
    assert.plan(1)

    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(`${server.url}/foo/bar?sort=id`)
    await page.assertUrl(`${server.url}/foo/bar?sort=id`)
  })

  test('assert page path', async ({ assert, cleanup }) => {
    assert.plan(1)

    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(`${server.url}/foo/bar`)
    await page.assertPath('/foo/bar')
  })

  test('assert page path with query string', async ({ assert, cleanup }) => {
    assert.plan(1)

    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(`${server.url}/foo/bar?sort=id`)
    await page.assertPath('/foo/bar')
  })

  test('assert page query string', async ({ assert, cleanup }) => {
    assert.plan(1)

    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(`${server.url}/foo/bar?sort=id`)
    await page.assertQueryString({ sort: 'id' })
  })

  test('assert page to have a cookie', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      if (req.url === '/set_cookie') {
        res.setHeader('set-cookie', 'cart_items=3')
      }

      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)
    await assert.rejects(
      () => page.assertCookie('cart_items'),
      `expected 'cart_items' cookie to exist`
    )

    await page.goto(`${server.url}/set_cookie`)
    await assert.doesNotRejects(() => page.assertCookie('cart_items'))

    await page.goto(`${server.url}/set_cookie`)
    await assert.rejects(
      () => page.assertCookie('cart_items', '2'),
      `expected 'cart_items' cookie value to equal '2'`
    )

    await page.goto(`${server.url}/set_cookie`)
    await assert.doesNotRejects(() => page.assertCookie('cart_items', '3'))
  })

  test('assert cookie to be missing', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      if (req.url === '/set_cookie') {
        res.setHeader('set-cookie', 'cart_items=3')
      }

      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)
    await assert.doesNotRejects(() => page.assertCookieMissing('cart_items'))

    await page.goto(`${server.url}/set_cookie`)
    await assert.rejects(
      () => page.assertCookieMissing('cart_items'),
      `expected 'cart_items' cookie to not exist`
    )
  })

  test('assert element innerText', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      if (req.url === '/set_cookie') {
        res.setHeader('set-cookie', 'cart_items=3')
      }

      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
          <h1> It works! </h1>
          <p> Hello world </p>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)
    await page.assertText('body', ['It works!', '', 'Hello world'].join('\n'))
    await page.assertText('h1', 'It works!')
    await page.assertText('p', 'Hello world')
  })

  test('assert elementsText', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      if (req.url === '/set_cookie') {
        res.setHeader('set-cookie', 'cart_items=3')
      }

      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
          <ul>
            <li> Hello world </li>
            <li> Hi world </li>
            <li> Bye world </li>
          </ul>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)
    await page.assertElementsText('ul > li', ['Hello world', 'Hi world', 'Bye world'])
  })

  test('assert element innerText to include substring', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      if (req.url === '/set_cookie') {
        res.setHeader('set-cookie', 'cart_items=3')
      }

      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
          <h1> It works! </h1>
          <p> Hello world </p>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)

    await page.assertTextContains('body', 'Hello world')
    await page.assertTextContains('h1', 'works')
    await page.assertTextContains('p', 'world')
  })

  test('assert a checkbox is checked', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      if (req.url === '/set_cookie') {
        res.setHeader('set-cookie', 'cart_items=3')
      }

      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
          <div>
            <input type="checkbox" name="terms" checked="true" /> Terms and conditions
            <input type="checkbox" name="newsletter" /> Subscribe to newsletter
            <input type="text" name="foo" />
          </div>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)

    await page.assertChecked('input[name="terms"]')
    await assert.rejects(
      () => page.assertChecked('input[name="newsletter"]'),
      `expected 'input[name="newsletter"]' checkbox to be checked`
    )

    await assert.rejects(
      () => page.assertChecked('input[name="foo"]'),
      `expected 'input[name="foo"]' to be a checkbox`
    )
  })

  test('assert a checkbox is not checked', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      if (req.url === '/set_cookie') {
        res.setHeader('set-cookie', 'cart_items=3')
      }

      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
          <div>
            <input type="checkbox" name="terms" checked="true" /> Terms and conditions
            <input type="checkbox" name="newsletter" /> Subscribe to newsletter
            <input type="text" name="foo" />
          </div>
        </body>
      </html>`)
      res.end()
    })

    const browser = await chromium.launch()
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()
    page.assert = assert
    addAssertions.page(page)

    await page.goto(server.url)

    await page.assertNotChecked('input[name="newsletter"]')
    await assert.rejects(
      () => page.assertNotChecked('input[name="terms"]'),
      `expected 'input[name="terms"]' checkbox to be not checked`
    )

    await assert.rejects(
      () => page.assertNotChecked('input[name="foo"]'),
      `expected 'input[name="foo"]' to be a checkbox`
    )
  })
})
