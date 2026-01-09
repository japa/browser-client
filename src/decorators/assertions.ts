/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import qs from '@poppinss/qs'
import { inspect } from 'node:util'
import { AssertionError } from 'node:assert'
import type { Locator, Page } from 'playwright'
import type { Decorator } from '../types/main.js'
import { isSubsetOf, retryTest } from '../helpers.js'
import { DEFAULT_ASSERTIONS_CONFIG } from '../plugin/normalize_config.js'

/**
 * Returns a Playwright locator for a given selector. If a locator is
 * already provided, it returns it as-is.
 *
 * @param selector - A CSS selector string or an existing Locator instance
 * @param page - The Playwright page instance
 */
function getLocator(selector: string | Locator, page: Page): Locator {
  return typeof selector === 'string' ? page.locator(selector) : selector
}

/**
 * Decorates the page object with custom assertions for testing browser interactions.
 * All assertions support automatic retries with configurable timeouts and poll intervals.
 *
 * @example
 * ```ts
 * // Assert element exists
 * await page.assertExists('.login-button')
 *
 * // Assert page title
 * await page.assertTitle('Login Page')
 *
 * // Assert URL contains substring
 * await page.assertUrlContains('/dashboard')
 *
 * // Assert element text
 * await page.assertText('h1', 'Welcome')
 * ```
 */
export const addAssertions = {
  /**
   * Adds assertion methods to the page object
   *
   * @param page - The Playwright page instance to decorate
   * @param _context - The browser context (unused but required by decorator interface)
   * @param config - Plugin configuration with assertion settings
   */
  page(page, _context, config) {
    const retrySettings = { ...DEFAULT_ASSERTIONS_CONFIG, ...config?.assertions }

    /**
     * Asserts that an element matching the selector exists on the page
     *
     * @param selector - CSS selector or Locator instance
     */
    page.assertExists = function assertExists(selector) {
      return retryTest(retrySettings, async () => {
        const matchingCount = await getLocator(selector, this).count()

        if (matchingCount <= 0) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} element to exist`,
            stackStartFn: assertExists,
          })
        }
      })
    }

    /**
     * Asserts that an element matching the selector does not exist on the page
     *
     * @param selector - CSS selector or Locator instance
     */
    page.assertNotExists = function assertNotExists(selector) {
      return retryTest(retrySettings, async () => {
        const matchingCount = await getLocator(selector, this).count()

        if (matchingCount !== 0) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} element to not exist`,
            stackStartFn: assertNotExists,
          })
        }
      })
    }

    /**
     * Asserts that the number of elements matching the selector equals the expected count
     *
     * @param selector - CSS selector or Locator instance
     * @param expectedCount - The expected number of elements
     */
    page.assertElementsCount = function assertElementsCount(selector, expectedCount) {
      return retryTest(retrySettings, async () => {
        const matchingCount = await getLocator(selector, this).count()

        if (matchingCount !== expectedCount) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} to have '${expectedCount}' elements`,
            stackStartFn: assertElementsCount,
            actual: matchingCount,
            expected: expectedCount,
          })
        }
      })
    }

    /**
     * Asserts that an element is visible on the page
     *
     * @param selector - CSS selector or Locator instance
     */
    page.assertVisible = function assertVisible(selector) {
      return retryTest(retrySettings, async () => {
        const isVisible = await getLocator(selector, this).isVisible()

        if (!isVisible) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} element to be visible`,
            stackStartFn: assertVisible,
          })
        }
      })
    }

    /**
     * Asserts that an element is not visible on the page
     *
     * @param selector - CSS selector or Locator instance
     */
    page.assertNotVisible = function assertNotVisible(selector) {
      return retryTest(retrySettings, async () => {
        const isVisible = await getLocator(selector, this).isVisible()

        if (isVisible) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} element to be not visible`,
            stackStartFn: assertNotVisible,
          })
        }
      })
    }

    /**
     * Asserts that the page title equals the expected value
     *
     * @param expectedTitle - The expected page title
     */
    page.assertTitle = function assertTitle(expectedTitle) {
      return retryTest(retrySettings, async () => {
        const title = await this.title()

        if (title !== expectedTitle) {
          throw new AssertionError({
            message: `expected page title '${title}' to equal '${expectedTitle}'`,
            stackStartFn: assertTitle,
            actual: title,
            expected: expectedTitle,
          })
        }
      })
    }

    /**
     * Asserts that the page title contains the expected substring
     *
     * @param expectedSubstring - The substring to search for in the title
     */
    page.assertTitleContains = function assertTitleContains(expectedSubstring) {
      return retryTest(retrySettings, async () => {
        const pageTitle = await this.title()

        if (!pageTitle.includes(expectedSubstring)) {
          throw new AssertionError({
            message: `expected page title '${pageTitle}' to include '${expectedSubstring}'`,
            stackStartFn: assertTitleContains,
          })
        }
      })
    }

    /**
     * Asserts that the page URL equals the expected value
     *
     * @param expectedUrl - The expected URL
     */
    page.assertUrl = function assertUrl(expectedUrl) {
      return retryTest(retrySettings, async () => {
        const url = this.url()

        if (url !== expectedUrl) {
          throw new AssertionError({
            message: `expected page URL '${url}' to equal '${expectedUrl}'`,
            stackStartFn: assertUrl,
            actual: url,
            expected: expectedUrl,
          })
        }
      })
    }

    /**
     * Asserts that the page URL contains the expected substring
     *
     * @param expectedSubstring - The substring to search for in the URL
     */
    page.assertUrlContains = function assertUrlContains(expectedSubstring) {
      return retryTest(retrySettings, async () => {
        const pageUrl = this.url()

        if (!pageUrl.includes(expectedSubstring)) {
          throw new AssertionError({
            message: `expected page URL '${pageUrl}' to include '${expectedSubstring}'`,
            stackStartFn: assertUrlContains,
          })
        }
      })
    }

    /**
     * Asserts that the page URL matches the given regular expression
     *
     * @param regex - The regular expression to match against the URL
     */
    page.assertUrlMatches = function assertUrlMatches(regex) {
      return retryTest(retrySettings, async () => {
        const url = this.url()

        if (!regex.test(url)) {
          throw new AssertionError({
            message: `expected page URL '${url}' to match '${regex}'`,
            stackStartFn: assertUrlMatches,
            actual: url,
            expected: regex,
          })
        }
      })
    }

    /**
     * Asserts that the page pathname equals the expected value
     *
     * @param expectedPathName - The expected pathname
     */
    page.assertPath = function assertPath(expectedPathName) {
      return retryTest(retrySettings, async () => {
        const { pathname } = new URL(this.url())

        if (pathname !== expectedPathName) {
          throw new AssertionError({
            message: `expected page pathname '${pathname}' to equal '${expectedPathName}'`,
            stackStartFn: assertPath,
            actual: pathname,
            expected: expectedPathName,
          })
        }
      })
    }

    /**
     * Asserts that the page pathname contains the expected substring
     *
     * @param expectedSubstring - The substring to search for in the pathname
     */
    page.assertPathContains = function assertPathContains(expectedSubstring) {
      return retryTest(retrySettings, async () => {
        const { pathname } = new URL(this.url())

        if (!pathname.includes(expectedSubstring)) {
          throw new AssertionError({
            message: `expected page pathname '${pathname}' to include '${expectedSubstring}'`,
            stackStartFn: assertPathContains,
          })
        }
      })
    }

    /**
     * Asserts that the page pathname matches the given regular expression
     *
     * @param regex - The regular expression to match against the pathname
     */
    page.assertPathMatches = function assertPathMatches(regex) {
      return retryTest(retrySettings, async () => {
        const { pathname } = new URL(this.url())

        if (!regex.test(pathname)) {
          throw new AssertionError({
            message: `expected page pathname '${pathname}' to match '${regex}'`,
            stackStartFn: assertPathMatches,
          })
        }
      })
    }

    /**
     * Asserts that the page URL query string contains the expected subset of parameters
     *
     * @param expectedSubset - Object containing expected query parameters
     */
    page.assertQueryString = function assertQueryString(expectedSubset) {
      return retryTest(retrySettings, async () => {
        const pageURL = new URL(this.url())
        const queryString = qs.parse(pageURL.search, { ignoreQueryPrefix: true })

        if (!isSubsetOf(queryString, expectedSubset)) {
          throw new AssertionError({
            message: `expected '${inspect(queryString)}' to contain '${inspect(expectedSubset)}'`,
            stackStartFn: assertQueryString,
            actual: queryString,
            expected: expectedSubset,
          })
        }
      })
    }

    /**
     * Asserts that a cookie exists and optionally matches the expected value
     *
     * @param cookieName - The name of the cookie
     * @param value - Optional expected value of the cookie
     */
    page.assertCookie = function assertCookie(cookieName, value?) {
      return retryTest(retrySettings, async () => {
        const pageCookies = await this.context().cookies()
        const matchingCookie = pageCookies.find(({ name }) => name === cookieName)

        if (!matchingCookie) {
          throw new AssertionError({
            message: `expected '${cookieName}' cookie to exist`,
            stackStartFn: assertCookie,
          })
        }

        if (value && matchingCookie.value !== value) {
          throw new AssertionError({
            message: `expected '${cookieName}' cookie value to equal '${value}'`,
            stackStartFn: assertCookie,
            actual: matchingCookie.value,
            expected: value,
          })
        }
      })
    }

    /**
     * Asserts that a cookie does not exist
     *
     * @param cookieName - The name of the cookie
     */
    page.assertCookieMissing = function assertCookieMissing(cookieName) {
      return retryTest(retrySettings, async () => {
        const pageCookies = await this.context().cookies()
        const matchingCookie = pageCookies.find(({ name }) => name === cookieName)

        if (matchingCookie) {
          throw new AssertionError({
            message: `expected '${cookieName}' cookie to not exist`,
            stackStartFn: assertCookieMissing,
          })
        }
      })
    }

    /**
     * Asserts that the inner text of an element equals the expected value
     *
     * @param selector - CSS selector or Locator instance
     * @param expectedValue - The expected text content
     */
    page.assertText = function assertText(selector, expectedValue) {
      return retryTest(retrySettings, async () => {
        const actual = await getLocator(selector, this).innerText({ timeout: 2000 })
        if (actual !== expectedValue) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} inner text to equal '${expectedValue}'`,
            stackStartFn: assertText,
            actual: actual,
            expected: expectedValue,
          })
        }
      })
    }

    /**
     * Asserts that multiple elements' inner text matches the expected values in order
     *
     * @param selector - CSS selector or Locator instance
     * @param expectedValues - Array of expected text values
     */
    page.assertElementsText = function assertElementsText(selector, expectedValues) {
      return retryTest(retrySettings, async () => {
        const innertTexts = await getLocator(selector, this).allInnerTexts()

        innertTexts.forEach((text, index) => {
          if (text !== expectedValues[index]) {
            throw new AssertionError({
              message: `expected ${inspect(selector)} value to deeply equal ${inspect(
                expectedValues
              )} in same order`,
              stackStartFn: assertElementsText,
              actual: innertTexts,
              expected: expectedValues,
            })
          }
        })
      })
    }

    /**
     * Asserts that the inner text of an element contains the expected substring
     *
     * @param selector - CSS selector or Locator instance
     * @param expectedSubstring - The substring to search for
     */
    page.assertTextContains = function assertTextContains(selector, expectedSubstring) {
      return retryTest(retrySettings, async () => {
        const actual = await getLocator(selector, this).innerText({ timeout: 2000 })

        if (!actual.includes(expectedSubstring)) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} inner text to include '${expectedSubstring}'`,
            stackStartFn: assertTextContains,
          })
        }
      })
    }

    /**
     * Asserts that a checkbox is checked
     *
     * @param selector - CSS selector or Locator instance
     */
    page.assertChecked = function assertChecked(selector) {
      return retryTest(retrySettings, async () => {
        let isChecked: boolean | undefined

        try {
          isChecked = await getLocator(selector, this).isChecked({ timeout: 2000 })
        } catch (error) {
          if (error.message.includes('Not a checkbox')) {
            throw new AssertionError({
              message: `expected ${inspect(selector)} to be a checkbox`,
              stackStartFn: assertChecked,
            })
          }

          throw error
        }

        /**
         * Assert only when we are able to locate the checkbox
         */
        if (isChecked === false) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} checkbox to be checked`,
            stackStartFn: assertChecked,
          })
        }
      })
    }

    /**
     * Asserts that a checkbox is not checked
     *
     * @param selector - CSS selector or Locator instance
     */
    page.assertNotChecked = function assertNotChecked(selector) {
      return retryTest(retrySettings, async () => {
        let isChecked: boolean | undefined

        try {
          isChecked = await getLocator(selector, this).isChecked({ timeout: 2000 })
        } catch (error) {
          if (error.message.includes('Not a checkbox')) {
            throw new AssertionError({
              message: `expected ${inspect(selector)} to be a checkbox`,
              stackStartFn: assertNotChecked,
            })
          }

          throw error
        }

        /**
         * Assert only when we are able to locate the checkbox
         */
        if (isChecked === true) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} checkbox to be not checked`,
            stackStartFn: assertNotChecked,
          })
        }
      })
    }

    /**
     * Asserts that an element is disabled
     *
     * @param selector - CSS selector or Locator instance
     */
    page.assertDisabled = function assertDisabled(selector) {
      return retryTest(retrySettings, async () => {
        const isDisabled = await getLocator(selector, this).isDisabled({ timeout: 2000 })

        if (!isDisabled) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} element to be disabled`,
            stackStartFn: assertDisabled,
          })
        }
      })
    }

    /**
     * Asserts that an element is not disabled
     *
     * @param selector - CSS selector or Locator instance
     */
    page.assertNotDisabled = function assertNotDisabled(selector) {
      return retryTest(retrySettings, async () => {
        const isDisabled = await getLocator(selector, this).isDisabled({ timeout: 2000 })

        if (isDisabled) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} element to be not disabled`,
            stackStartFn: assertNotDisabled,
          })
        }
      })
    }

    /**
     * Asserts that an input, textarea, or select element has the expected value
     *
     * @param selector - CSS selector or Locator instance
     * @param expectedValue - The expected input value
     */
    page.assertInputValue = function assertInputValue(selector, expectedValue) {
      return retryTest(retrySettings, async () => {
        let inputValue: string | undefined

        try {
          inputValue = await getLocator(selector, this).inputValue({ timeout: 2000 })
        } catch (error) {
          if (error.message.includes('Node is not')) {
            throw new AssertionError({
              message: `expected ${inspect(selector)} element to be an input, select or a textarea`,
              stackStartFn: assertInputValue,
            })
          }

          throw error
        }

        if (inputValue !== expectedValue) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} value to equal '${expectedValue}'`,
            stackStartFn: assertInputValue,
            actual: inputValue,
            expected: expectedValue,
          })
        }
      })
    }

    /**
     * Asserts that a select element has the expected selected options
     *
     * @param selector - CSS selector string
     * @param expectedValues - Array of expected selected option values
     */
    page.assertSelectedOptions = function assertSelectedOptions(selector, expectedValues) {
      return retryTest(retrySettings, async () => {
        const element = await this.$eval(selector, (node) => {
          /* c8 ignore start */
          if (node.nodeName === 'SELECT') {
            const options = [...node.options]
            return {
              multiple: node.multiple,
              selected: options
                .filter((option: any) => option.selected)
                .map((option: any) => option.value),
            }
          }
          /* c8 ignore end */
        })

        /**
         * Not a select box
         */
        if (!element) {
          throw new AssertionError({
            message: `expected ${inspect(selector)} element to be a select box`,
            stackStartFn: assertSelectedOptions,
          })
        }

        /**
         * Using different assertions for multiple and single
         * select boxes
         */
        if (element.multiple) {
          element.selected.forEach((elem) => {
            if (!expectedValues.includes(elem)) {
              throw new AssertionError({
                message: `expected ${inspect(selector)} value to deeply equal ${inspect(
                  expectedValues
                )}`,
                stackStartFn: assertSelectedOptions,
                actual: element.selected,
                expected: expectedValues,
              })
            }
          })
        } else {
          if (element.selected[0] !== expectedValues[0]) {
            throw new AssertionError({
              message: `expected ${inspect(selector)} value to equal ${inspect(expectedValues)}`,
              stackStartFn: assertSelectedOptions,
              actual: element.selected[0],
              expected: expectedValues[0],
            })
          }
        }
      })
    }
  },
} satisfies Decorator
