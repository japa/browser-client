/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import qs from 'qs'
import type { Assert } from '@japa/assert'
import type { Decorator } from '../types'

/**
 * Types for custom methods
 */
declare module 'playwright' {
  export interface Page {
    assert: Assert

    /**
     * Assert an element to exists
     */
    assertExists(selector: string): Promise<void>

    /**
     * Assert an element to exists and have matching count
     */
    assertElementsCount(selector: string, expectedCount: number): Promise<void>

    /**
     * Assert the page title to match the expected
     * value
     */
    assertTitle(expectedTitle: string): Promise<void>

    /**
     * Assert the page title to include a substring value
     */
    assertTitleContains(expectedSubstring: string): Promise<void>

    /**
     * Assert the page URL to match the expected
     * value
     */
    assertUrl(expectedUrl: string): Promise<void>

    /**
     * Assert the page path to match the expected value. The URL
     * is parsed using the Node.js URL parser and the pathname
     * value is used for assertion.
     */
    assertPath(expectedPathName: string): Promise<void>

    /**
     * Asserts the page URL querystring to match the subset
     * object
     */
    assertQueryString(queryStringSubset: Record<string, any>): Promise<void>

    /**
     * Assert cookie to exist and optionally match the expected
     * value
     */
    assertCookie(cookieName: string, value?: any): Promise<void>

    /**
     * Assert cookie to be missing
     */
    assertCookieMissing(cookieName: string): Promise<void>

    /**
     * Assert innerText of a given selector to equal
     * the expected value
     */
    assertText(selector: string, expectedValue: string): Promise<void>

    /**
     * Assert innerText of a given selector elements to match
     * the expected values
     */
    assertElementsText(selector: string, expectedValues: string[]): Promise<void>

    /**
     * Assert innerText of a given selector to include
     * substring
     */
    assertTextContains(selector: string, expectedSubstring: string): Promise<void>

    /**
     * Assert a checkbox to be checked
     */
    assertChecked(selector: string): Promise<void>

    /**
     * Assert a checkbox not to be checked
     */
    assertNotChecked(selector: string): Promise<void>
  }
}

/**
 * Decorates the page object with custom assertions
 */
export const addAssertions = {
  page(page) {
    page.assertExists = async function (selector) {
      const matchingCount = await this.locator(selector).count()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(matchingCount > 0, 'expected #{this} element to exist', {
        thisObject: selector,
        actual: '',
        expected: '',
        showDiff: false,
        operator: 'strictEqual',
      })
    }

    page.assertElementsCount = async function (selector, expectedCount) {
      const matchingCount = await this.locator(selector).count()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(
        matchingCount === expectedCount,
        'expected #{this} to have #{exp} elements',
        {
          thisObject: selector,
          actual: matchingCount,
          expected: expectedCount,
          showDiff: true,
          operator: 'strictEqual',
        }
      )
    }

    page.assertTitle = async function (expectedTitle) {
      const pageTitle = await this.title()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(pageTitle === expectedTitle, 'expected page title to equal #{exp}', {
        actual: pageTitle,
        expected: expectedTitle,
        showDiff: true,
        operator: 'strictEqual',
      })
    }

    page.assertTitleContains = async function (expectedSubstring) {
      const pageTitle = await this.title()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(
        pageTitle.includes(expectedSubstring),
        'expected page title to include #{exp}',
        {
          actual: pageTitle,
          expected: expectedSubstring,
          showDiff: false,
          operator: 'strictEqual',
        }
      )
    }

    page.assertUrl = async function (expectedUrl) {
      const pageURL = this.url()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(pageURL === expectedUrl, 'expected page URL to equal #{exp}', {
        actual: pageURL,
        expected: expectedUrl,
        showDiff: true,
        operator: 'strictEqual',
      })
    }

    page.assertPath = async function (expectedPathName) {
      const pageURL = new URL(this.url())

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(
        pageURL.pathname === expectedPathName,
        'expected page path to equal #{exp}',
        {
          actual: pageURL.pathname,
          expected: expectedPathName,
          showDiff: true,
          operator: 'strictEqual',
        }
      )
    }

    page.assertQueryString = async function (queryStringSubset) {
      const pageURL = new URL(this.url())
      this.assert.containsSubset(
        qs.parse(pageURL.search, { ignoreQueryPrefix: true }),
        queryStringSubset
      )
    }

    page.assertCookie = async function (cookieName, value?) {
      const pageCookies = await this.context().cookies()
      this.assert.incrementAssertionsCount()

      const matchingCookie = pageCookies.find(({ name }) => name === cookieName)
      if (!matchingCookie) {
        this.assert.evaluate(false, 'expected #{exp} cookie to exist', {
          actual: null,
          expected: cookieName,
          showDiff: false,
          operator: 'strictEqual',
        })

        return
      }

      if (value) {
        this.assert.evaluate(
          matchingCookie.value === value,
          'expected #{this} cookie value to equal #{exp}',
          {
            thisObject: cookieName,
            actual: matchingCookie.value,
            expected: value,
            showDiff: true,
            operator: 'strictEqual',
          }
        )

        return
      }
    }

    page.assertCookieMissing = async function (cookieName) {
      const pageCookies = await this.context().cookies()
      this.assert.incrementAssertionsCount()

      const matchingCookie = pageCookies.find(({ name }) => name === cookieName)
      if (matchingCookie) {
        this.assert.evaluate(false, 'expected #{exp} cookie to not exist', {
          actual: null,
          expected: cookieName,
          showDiff: false,
          operator: 'strictEqual',
        })

        return
      }
    }

    page.assertText = async function (selector: string, expectedValue: string) {
      this.assert.incrementAssertionsCount()

      const actual = await this.locator(selector).innerText()
      this.assert.evaluate(
        actual === expectedValue,
        'expected #{this} inner text to equal #{exp}',
        {
          thisObject: selector,
          actual: actual,
          expected: expectedValue,
          showDiff: true,
          operator: 'strictEqual',
        }
      )
    }

    page.assertElementsText = async function (selector: string, expectedValues: string[]) {
      const innertTexts = await this.locator(selector).allInnerTexts()
      this.assert.deepEqual(innertTexts, expectedValues)
    }

    page.assertTextContains = async function (selector: string, expectedSubstring: string) {
      this.assert.incrementAssertionsCount()

      const actual = await this.locator(selector).innerText()
      this.assert.evaluate(
        actual.includes(expectedSubstring),
        'expected #{this} inner text to include #{exp}',
        {
          thisObject: selector,
          actual: actual,
          expected: expectedSubstring,
          showDiff: false,
          operator: 'strictEqual',
        }
      )
    }

    page.assertChecked = async function (selector: string) {
      let isChecked: boolean | undefined

      try {
        isChecked = await this.locator(selector).isChecked()
      } catch (error) {
        if (error.message.includes('Not a checkbox')) {
          this.assert.incrementAssertionsCount()
          this.assert.evaluate(false, 'expected #{this} to be a checkbox', {
            thisObject: selector,
            actual: '',
            expected: '',
            showDiff: false,
            operator: 'strictEqual',
          })

          return
        }

        throw error
      }

      /**
       * Assert only when we are able to locate the checkbox
       */
      if (isChecked !== undefined) {
        this.assert.incrementAssertionsCount()
        this.assert.evaluate(isChecked, 'expected #{this} checkbox to be checked', {
          thisObject: selector,
          actual: '',
          expected: '',
          showDiff: false,
          operator: 'strictEqual',
        })
      }
    }

    page.assertNotChecked = async function (selector: string) {
      let isChecked: boolean | undefined

      try {
        isChecked = await this.locator(selector).isChecked()
      } catch (error) {
        if (error.message.includes('Not a checkbox')) {
          this.assert.incrementAssertionsCount()
          this.assert.evaluate(false, 'expected #{this} to be a checkbox', {
            thisObject: selector,
            actual: '',
            expected: '',
            showDiff: false,
            operator: 'strictEqual',
          })

          return
        }

        throw error
      }

      /**
       * Assert only when we are able to locate the checkbox
       */
      if (isChecked !== undefined) {
        this.assert.incrementAssertionsCount()
        this.assert.evaluate(!isChecked, 'expected #{this} checkbox to be not checked', {
          thisObject: selector,
          actual: '',
          expected: '',
          showDiff: false,
          operator: 'strictEqual',
        })
      }
    }
  },
} satisfies Decorator
