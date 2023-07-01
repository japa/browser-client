/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Page } from 'playwright'
import type { BasePage } from '../base_page.js'
import type { Decorator, VisitOptions } from '../types.js'

/**
 * Decorates the context with the visit method.
 */
export const addVisitMethod = {
  context(context) {
    context.visit = async function <PageModel extends typeof BasePage>(
      UrlOrPage: string | PageModel,
      callbackOrOptions?: ((page: InstanceType<PageModel>) => void | Promise<void>) | VisitOptions
    ): Promise<void | InstanceType<PageModel> | Page> {
      const page = await context.newPage()

      /**
       * If Url is a string, then visit the page
       * and return value
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
       * Visit the url of the base model
       */
      await page.goto(pageInstance.url, pageInstance.visitOptions)

      /**
       * Invoke callback if exists
       */
      if (typeof callbackOrOptions === 'function') {
        await callbackOrOptions(pageInstance as InstanceType<PageModel>)
        return
      }

      /**
       * Otherwise return the page instance back
       */
      return pageInstance as InstanceType<PageModel>
    }
  },
} satisfies Decorator
