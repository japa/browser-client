/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Decorator } from '../types'
import type { BasePage } from '../base_page'
import type { Page } from '../../modules/playwright'

/**
 * Types for custom methods
 */
declare module '../../modules/playwright' {
  export interface BrowserContext {
    /**
     * Open a new page and visit a URL
     */
    visit(url: string): Promise<Page>

    /**
     * Open a new page using a page model
     */
    visit<PageModel extends typeof BasePage>(page: PageModel): Promise<InstanceType<PageModel>>

    /**
     * Open a new page using a page model and access it's
     * instance inside the callback.
     */
    visit<PageModel extends typeof BasePage>(
      page: PageModel,
      callback: (page: InstanceType<PageModel>) => void | Promise<void>
    ): Promise<void>
  }
}

/**
 * Decorates the context with the visit method.
 */
export const addVisitMethod: Decorator = {
  context(context) {
    context.visit = async function <PageModel extends typeof BasePage>(
      UrlOrPage: string | PageModel,
      callback?: (page: InstanceType<PageModel>) => void | Promise<void>
    ): Promise<void | InstanceType<PageModel> | Page> {
      const page = await context.newPage()

      /**
       * If Url is a string, then visit the page
       * and return value
       */
      if (typeof UrlOrPage === 'string') {
        await page.goto(UrlOrPage)
        return page
      }

      /**
       * Create an instance of the page model
       */
      const pageInstance = new UrlOrPage(page, context)

      /**
       * Visit the url of the base model
       */
      await page.goto(pageInstance.url)

      /**
       * Invoke callback if exists
       */
      if (callback) {
        await callback(pageInstance as InstanceType<PageModel>)
        return
      }

      /**
       * Otherwise return the page instance back
       */
      return pageInstance as InstanceType<PageModel>
    }
  },
}
