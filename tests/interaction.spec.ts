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

import { BasePage } from '../src/base_page'
import { decorateBrowser } from '../src/browser'
import { ServerFactory } from '../factories/server'
import { addUseMethod } from '../src/decorators/use'
import { addVisitMethod } from '../src/decorators/visit'
import { BaseInteraction } from '../src/base_interaction'

test.group('Interaction', () => {
  test('assert interaction name', async ({ assert }) => {
    class FormInteraction extends BaseInteraction {}
    assert.equal(
      Object.prototype.toString.call(new FormInteraction({} as any, {} as any)),
      '[object Promise]'
    )
  })

  test('use interaction to run async actions', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
          <div>
            <input type="checkbox" name="terms" /> Terms and conditions
          </div>
        </body>
      </html>`)
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addVisitMethod])
    cleanup(async () => {
      await browser.close()
      await server.close()
    })

    class FormInteraction extends BaseInteraction {
      checkTerms() {
        return this.defer(() => this.page.locator('input[name="terms"]').check())
      }

      assertIsChecked() {
        return this.defer(async () => {
          assert.isTrue(await this.page.locator('input[name="terms"]').isChecked())
        })
      }
    }

    class HomePage extends BasePage {
      url: string = server.url
      form = new FormInteraction(this.page, this.context)
    }

    const context = await browser.newContext()
    const page = await context.visit(HomePage)
    await page.form.checkTerms().assertIsChecked()
  })

  test('mount interaction to an existing page', async ({ assert, cleanup }) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
          <div>
            <input type="checkbox" name="terms" /> Terms and conditions
          </div>
        </body>
      </html>`)
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addVisitMethod, addUseMethod])
    cleanup(async () => {
      await browser.close()
      await server.close()
    })

    class FormInteraction extends BaseInteraction {
      checkTerms() {
        return this.defer(() => this.page.locator('input[name="terms"]').check())
      }

      assertIsChecked() {
        return this.defer(async () => {
          assert.isTrue(await this.page.locator('input[name="terms"]').isChecked())
        })
      }
    }

    const context = await browser.newContext()
    const page = await context.visit(server.url)
    await page.use(FormInteraction).checkTerms().assertIsChecked()
  })

  test('handle interaction failures', async ({ assert, cleanup }, done) => {
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

    const browser = decorateBrowser(await chromium.launch(), [addVisitMethod, addUseMethod])
    cleanup(async () => {
      await browser.close()
      await server.close()
    })

    class FormInteraction extends BaseInteraction {
      checkTerms() {
        return this.defer(() => this.page.locator('input[name="terms"]').check({ timeout: 100 }))
      }

      assertIsChecked() {
        return this.defer(async () => {
          assert.isTrue(await this.page.locator('input[name="terms"]').isChecked())
        })
      }
    }

    const context = await browser.newContext()
    const page = await context.visit(server.url)
    page
      .use(FormInteraction)
      .checkTerms()
      .assertIsChecked()
      .catch((error) => {
        assert.match(error.message, /locator.check: Timeout 100ms/)
        done()
      })
  }).waitForDone()

  test('wait for interaction to finish or fail', async ({ assert, cleanup }, done) => {
    const server = new ServerFactory()
    await server.create((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.write(`<html>
        <head>
          <title> Hello world </title>
        </head>
        <body>
          <input type="checkbox" name="terms" /> Terms and conditions
        </body>
      </html>`)
      res.end()
    })

    const browser = decorateBrowser(await chromium.launch(), [addVisitMethod, addUseMethod])
    cleanup(async () => {
      await browser.close()
      await server.close()
    })

    class FormInteraction extends BaseInteraction {
      checkTerms() {
        return this.defer(() => this.page.locator('input[name="terms"]').check({ timeout: 100 }))
      }

      assertIsChecked() {
        return this.defer(async () => {
          assert.isTrue(await this.page.locator('input[name="terms"]').isChecked())
        })
      }
    }

    const context = await browser.newContext()
    const page = await context.visit(server.url)
    page
      .use(FormInteraction)
      .checkTerms()
      .assertIsChecked()
      .finally(() => {
        done()
      })
  }).waitForDone()
})
