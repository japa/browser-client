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

import { decorateBrowser } from '../../index.js'
import { ServerFactory } from '../../factories/server.js'
import { addAssertions } from '../../src/decorators/assertions.js'
import type { PluginConfig } from '../../src/types/main.js'
import { basicDocument } from '../helpers.js'

test.group('Assertions', () => {
  // Use short timeout for expect in order to speed up tests for failing assertions
  const pluginConfig: PluginConfig = {
    assertions: {
      timeout: 200,
    },
  }

  test('assert element to exist', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <p> Hello world </p>
            <h1 style="display: none"> Title </h1>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertExists('p')
    await page.assertExists('h1')
    await assert.rejects(() => page.assertExists('span'), /expected 'span' element to exist/)

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.body.appendChild(document.createElement('h2'))
      }, 50)
    })
    await page.assertExists(page.locator('h2'))
  })

  test('assert elements to have expected count', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <p> Hello world </p>
            <p> Hi world </p>

            <h1 style="display: none"> Title </h1>

            <ul>
              <li> Hello world </li>
              <li> Hi world </li>
              <li> Bye world </li>
            </ul>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertElementsCount('p', 2)
    await page.assertElementsCount('h1', 1)
    await page.assertElementsCount('ul > li ', 3)
    await assert.rejects(
      () => page.assertElementsCount('span', 1),
      /expected 'span' to have '1' elements/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('ul').appendChild(document.createElement('li'))
      }, 50)
    })
    await page.assertElementsCount('ul > li ', 4)
  })

  test('assert element to not exist', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument({ body: `<h1 style="display: none"> Title </h1>` }))
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertNotExists('p')
    await page.assertNotExists('span')
    await assert.rejects(() => page.assertNotExists('h1'), /expected 'h1' element to not exist/)

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('h1').remove()
      }, 50)
    })
    await page.assertNotExists('h1')
  })

  test('assert element to be visible', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <p> Hello world </p>
            <h1 style="display: none"> Title </h1>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertVisible('p')
    await assert.rejects(() => page.assertVisible('h1'), /expected 'h1' element to be visible/)
    await assert.rejects(() => page.assertVisible('span'), /expected 'span' element to be visible/)

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('h1').style.display = ''
      }, 50)
    })
    await page.assertVisible('h1')
  })

  test('assert element to be not visible', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <p> Hello world </p>
            <h1 style="display: none"> Title </h1>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertNotVisible('h1')
    await page.assertNotVisible('span')
    await assert.rejects(() => page.assertNotVisible('p'), /expected 'p' element to be not visible/)

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('p').style.display = 'none'
      }, 50)
    })
    await page.assertNotVisible('p')
  })

  test('assert page title', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument({ title: 'Hello world' }))
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertTitle('Hello world')
    await assert.rejects(
      () => page.assertTitle('Foo'),
      /expected page title 'Hello world' to equal 'Foo'/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.title = 'New title'
      }, 50)
    })
    await page.assertTitle('New title')
  })

  test('assert page title to include a substr', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument({ title: 'Hello world' }))
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertTitleContains('world')
    await assert.rejects(
      () => page.assertTitleContains('Foo'),
      /expected page title 'Hello world' to include 'Foo'/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.title = 'New title'
      }, 50)
    })
    await page.assertTitleContains('New ')
  })

  test('assert page URL', async ({ assert, cleanup }) => {
    assert.plan(1)

    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(`${server.url}/foo/bar`)
    await page.assertUrl(`${server.url}/foo/bar`)
    await assert.rejects(
      () => page.assertUrl('Foo'),
      new RegExp("expected page URL 'http://localhost:3000/foo/bar' to equal 'Foo'")
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        location.href = '/bar/foo'
      }, 50)
    })
    await page.assertUrl(`${server.url}/bar/foo`)
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

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(`${server.url}/foo/bar?sort=id`)
    await page.assertUrl(`${server.url}/foo/bar?sort=id`)
    await assert.rejects(
      () => page.assertUrl('Foo?sort=id'),
      new RegExp(
        "expected page URL 'http://localhost:3000/foo/bar\\?sort=id' to equal 'Foo\\?sort=id'"
      )
    )
  })

  test('assert page URL to include a substring', async ({ assert, cleanup }) => {
    assert.plan(1)

    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(`${server.url}/foo/bar?sort=id`)
    await page.assertUrlContains(`${server.url}/foo/bar`)
    await assert.rejects(
      () => page.assertUrlContains('baz'),
      new RegExp("expected page URL 'http://localhost:3000/foo/bar\\?sort=id' to include 'baz'")
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        location.href = '/bar/foo'
      }, 50)
    })
    await page.assertUrlContains('ar/fo')
  })

  test('assert page URL to match regex', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(`${server.url}/foo/bar?sort=id`)
    await page.assertUrlMatches(/foo/)
    await assert.rejects(
      () => page.assertUrlMatches(/baz/),
      new RegExp("expected page URL 'http://localhost:3000/foo/bar\\?sort=id' to match '/baz/'")
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        location.href = '/bar/foo'
      }, 50)
    })
    await page.assertUrlMatches(/ar\/fo/)
  })

  test('assert page path', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(`${server.url}/foo/bar`)
    await page.assertPath('/foo/bar')
    await assert.rejects(
      () => page.assertPath('baz'),
      new RegExp("expected page pathname '/foo/bar' to equal 'baz'")
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        location.href = '/bar/foo'
      }, 50)
    })
    await page.assertPath('/bar/foo')
  })

  test('assert page path to contain a substring', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(`${server.url}/foo/bar`)
    await page.assertPathContains('foo')
    await assert.rejects(
      () => page.assertPathContains('baz'),
      new RegExp("expected page pathname '/foo/bar' to include 'baz'")
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        location.href = '/bar/foo'
      }, 50)
    })
    await page.assertPathContains('ar/fo')
  })

  test('assert page path to match regex', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(`${server.url}/foo/bar`)
    await page.assertPathMatches(/foo/)
    await assert.rejects(
      () => page.assertPathMatches(/baz/),
      new RegExp("expected page pathname '/foo/bar' to match '/baz/'")
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        location.href = '/bar/foo'
      }, 50)
    })
    await page.assertPathMatches(/ar\/fo/)
  })

  test('assert page path with query string', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(`${server.url}/foo/bar?sort=id`)
    await page.assertPath('/foo/bar')
    await assert.rejects(
      () => page.assertPath('baz'),
      /expected page pathname '\/foo\/bar' to equal 'baz'/
    )
  })

  test('assert page query string', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(`${server.url}/foo/bar?sort=id&sortDir=asc`)
    await page.assertQueryString({ sort: 'id' })
    await page.assertQueryString({ sortDir: 'asc' })
    await assert.rejects(
      () => page.assertQueryString({ orderBy: 'id' }),
      /expected '\{ sort: 'id', sortDir: 'asc' \}' to contain '\{ orderBy: 'id' \}'/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        location.href = '/foo/bar?sort=id&sortDir=desc'
      }, 50)
    })
    await page.assertQueryString({ sortDir: 'desc' })
  })

  test('assert page to have a cookie', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      if (req.url === '/set_cookie') {
        res.setHeader('set-cookie', 'cart_items=3')
      }

      if (req.url === '/set_other_cookie') {
        res.setHeader('set-cookie', 'cart_items=4')
      }

      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await assert.rejects(
      () => page.assertCookie('cart_items'),
      /expected 'cart_items' cookie to exist/
    )

    await page.goto(`${server.url}/set_cookie`)
    await page.assertCookie('cart_items')

    await page.goto(`${server.url}/set_cookie`)
    await assert.rejects(
      () => page.assertCookie('cart_items', '2'),
      /expected 'cart_items' cookie value to equal '2'/
    )

    await page.goto(`${server.url}/set_cookie`)
    await page.assertCookie('cart_items', '3')

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        location.href = '/set_other_cookie'
      }, 50)
    })
    await page.assertCookie('cart_items', '4')
  })

  test('assert cookie to be missing', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((req, res) => {
      if (req.url === '/set_cookie') {
        res.setHeader('set-cookie', 'cart_items=3')
      }

      res.setHeader('content-type', 'text/html')
      res.write(basicDocument())
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertCookieMissing('cart_items')

    await page.goto(`${server.url}/set_cookie`)
    await assert.rejects(
      () => page.assertCookieMissing('cart_items'),
      /expected 'cart_items' cookie to not exist/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.cookie =
          'cart_items=; Max-Age=0; path=/; domain=localhost;expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }, 50)
    })
    await page.assertCookieMissing('cart_items')
  })

  test('assert element innerText', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <h1> It works! </h1>
            <p> Hello world </p>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertText('body', ['It works!', '', 'Hello world'].join('\n'))
    await page.assertText('h1', 'It works!')
    await page.assertText('p', 'Hello world')

    await assert.rejects(
      () => page.assertText('p', 'Aloha'),
      /expected 'p' inner text to equal 'Aloha'/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('p').innerText = 'Aloha'
      }, 50)
    })
    await page.assertText('p', 'Aloha')
  })

  test('assert elementsText', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <ul>
              <li> Hello world </li>
              <li> Hi world </li>
              <li> Bye world </li>
            </ul>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)
    await page.assertElementsText('ul > li', ['Hello world', 'Hi world', 'Bye world'])

    await assert.rejects(
      () => page.assertElementsText('ul > li', ['Hello world', 'Hi world', 'Goodbye world']),
      /expected 'ul > li' value to deeply equal \[ 'Hello world', 'Hi world', 'Goodbye world' \] in same order/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('li:last-child').innerText = 'Goodbye world'
      }, 50)
    })
    await page.assertElementsText('ul > li', ['Hello world', 'Hi world', 'Goodbye world'])
  })

  test('assert element innerText to include substring', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <h1> It works! </h1>
            <p> Hello world </p>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)

    await page.assertTextContains('body', 'Hello world')
    await page.assertTextContains('h1', 'works')
    await page.assertTextContains('p', 'world')
    await assert.rejects(
      () => page.assertTextContains('p', 'Aloha'),
      /expected 'p' inner text to include 'Aloha'/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('p').innerText = 'Aloha world'
      }, 50)
    })
    await page.assertTextContains('p', 'Aloha')
  })

  test('assert a checkbox is checked', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <div>
              <input type="checkbox" name="terms" checked="true" /> Terms and conditions
              <input type="checkbox" name="newsletter" /> Subscribe to newsletter
              <input type="text" name="foo" />
            </div>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)

    await page.assertChecked('input[name="terms"]')
    await assert.rejects(
      () => page.assertChecked('input[name="newsletter"]'),
      /expected 'input\[name="newsletter"\]' checkbox to be checked/
    )

    await assert.rejects(
      () => page.assertChecked('input[name="foo"]'),
      /expected 'input\[name="foo"\]' to be a checkbox/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('input[name="newsletter"]').checked = true
      }, 50)
    })
    await page.assertChecked('input[name="newsletter"]')
  })

  test('assert a checkbox is not checked', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <div>
              <input type="checkbox" name="terms" checked="true" /> Terms and conditions
              <input type="checkbox" name="newsletter" /> Subscribe to newsletter
              <input type="text" name="foo" />
            </div>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)

    await page.assertNotChecked('input[name="newsletter"]')
    await assert.rejects(
      () => page.assertNotChecked('input[name="terms"]'),
      /expected 'input\[name="terms"\]' checkbox to be not checked/
    )

    await assert.rejects(
      () => page.assertNotChecked('input[name="foo"]'),
      /expected 'input\[name="foo"\]' to be a checkbox/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('input[name="terms"]').checked = false
      }, 50)
    })
    await page.assertNotChecked('input[name="terms"]')
  })

  test('assert element is disabled', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <input type="checkbox" name="terms" disabled="true" /> Terms and conditions
            <input type="checkbox" name="newsletter" /> Subscribe to newsletter
            <div id="foo"></div>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)

    await page.assertDisabled('input[name="terms"]')
    await assert.rejects(
      () => page.assertDisabled('input[name="newsletter"]'),
      /expected 'input\[name="newsletter"\]' element to be disabled/
    )
    await assert.rejects(
      () => page.assertDisabled('#foo'),
      /expected '#foo' element to be disabled/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('input[name="newsletter"]').toggleAttribute('disabled', true)
      }, 50)
    })
    await page.assertDisabled('input[name="newsletter"]')
  })

  test('assert element is not disabled', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <input type="checkbox" name="terms" disabled="true" /> Terms and conditions
            <input type="checkbox" name="newsletter" /> Subscribe to newsletter
            <div id="foo"></div>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)

    await page.assertNotDisabled('input[name="newsletter"]')
    await page.assertNotDisabled('#foo')
    await assert.rejects(
      () => page.assertNotDisabled('input[name="terms"]'),
      /expected 'input\[name="terms"\]' element to be not disabled/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('input[name="terms"]').toggleAttribute('disabled', false)
      }, 50)
    })
    await page.assertNotDisabled('input[name="terms"]')
  })

  test('assert input value', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <input type="text" name="fullname" />
            <input type="number" name="age" />
            <select name="country">
              <option value="IND"> India </option>
              <option value="FR"> France </option>
              <option value="USA"> United states </option>
            </select>
            <div id="foo"></div>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)

    await page.fill('input[name="fullname"]', 'virk')
    await page.assertInputValue('input[name="fullname"]', 'virk')

    await page.selectOption('select[name="country"]', 'IND')
    await page.assertInputValue('select[name="country"]', 'IND')

    await page.fill('input[name="age"]', '32')
    await page.assertInputValue('input[name="age"]', '32')

    await assert.rejects(
      () => page.assertInputValue('#foo', 'IND'),
      /expected '#foo' element to be an input, select or a textarea/
    )
    await assert.rejects(
      () => page.assertInputValue('input[name="fullname"]', 'john doe'),
      /expected 'input\[name="fullname"\]' value to equal 'john doe'/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('input[name="fullname"]').value = 'john doe'
      }, 50)
    })
    await page.assertInputValue('input[name="fullname"]', 'john doe')
  })

  test('assert select options', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(
        basicDocument({
          body: `
            <select name="country">
              <option value="IND"> India </option>
              <option value="FR"> France </option>
              <option value="USA"> United states </option>
            </select>

            <select name="tags" multiple>
              <option value="node_js"> Node.js </option>
              <option value="js"> JavaScript </option>
              <option value="php"> PHP </option>
              <option value="css"> CSS </option>
              <option value="html"> HTML </option>
            </select>

            <div id="foo"></div>
          `,
        })
      )
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addAssertions], pluginConfig)
    cleanup(async () => {
      await server.close()
      await browser.close()
    })

    const page = await browser.newPage()

    await page.goto(server.url)

    await page.selectOption('select[name="country"]', 'IND')
    await page.assertSelectedOptions('select[name="country"]', ['IND'])

    await page.selectOption('select[name="tags"]', ['js', 'css'])
    await page.assertSelectedOptions('select[name="tags"]', ['css', 'js'])

    await assert.rejects(
      () => page.assertSelectedOptions('#foo', []),
      /expected '#foo' element to be a select box/
    )
    await assert.rejects(
      () => page.assertSelectedOptions('select[name="country"]', ['FR']),
      /expected 'select\[name="country"\]' value to equal \[ 'FR' \]/
    )

    await page.evaluate(() => {
      setTimeout(() => {
        // @ts-expect-error
        document.querySelector('select[name="country"]').value = 'FR'
      }, 50)
    })
    await page.assertSelectedOptions('select[name="country"]', ['FR'])
  })
})
