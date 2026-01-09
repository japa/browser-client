/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Page } from 'playwright'
import type { BasePage } from '../base/base_page.js'
import type { Decorator, VisitOptions } from '../types/main.js'

/**
 * Decorates the browser context with the visit method for navigating
 * to URLs or using page models.
 *
 * @example
 * ```ts
 * // Visit a URL directly
 * const page = await context.visit('https://example.com')
 *
 * // Visit using a page model and get the instance
 * const loginPage = await context.visit(LoginPage)
 * await loginPage.login('user@example.com', 'password')
 *
 * // Visit using a page model with a callback
 * await context.visit(LoginPage, async (page) => {
 *   await page.login('user@example.com', 'password')
 * })
 * ```
 */
export const addVisitMethod = {
  /**
   * Adds the visit method to the browser context
   *
   * @param context - The Playwright browser context to decorate
   */
  context(context) {
    /**
     * Creates a new page and navigates to a URL or page model
     *
     * @param UrlOrPage - URL string or page model class
     * @param callbackOrOptions - Optional callback for page models or navigation options for URLs
     */
    context.visit = async function <PageModel extends typeof BasePage>(
      UrlOrPage: string | PageModel,
      callbackOrOptions?: ((page: InstanceType<PageModel>) => void | Promise<void>) | VisitOptions
    ): Promise<void | InstanceType<PageModel> | Page> {
      const page = await context.newPage()

      /**
       * If Url is a string, then visit the page
       * and return the page instance
       */
      if (typeof UrlOrPage === 'string') {
        await page.goto(UrlOrPage, callbackOrOptions as VisitOptions)
        return page
      }

      /**
       * Create an instance of the page model
       */
      const pageInstance = new UrlOrPage(page, context)

      /**
       * Visit the url defined in the page model
       */
      await page.goto(pageInstance.url, pageInstance.visitOptions)

      /**
       * Invoke callback if exists and return void
       */
      if (typeof callbackOrOptions === 'function') {
        await callbackOrOptions(pageInstance as InstanceType<PageModel>)
        return
      }

      /**
       * Otherwise return the page instance
       */
      return pageInstance as InstanceType<PageModel>
    }
  },
} satisfies Decorator
