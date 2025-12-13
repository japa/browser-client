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
 * Returns locator for a selector
 */
function getLocator(selector: string | Locator, page: Page): Locator {
  return typeof selector === 'string' ? page.locator(selector) : selector
}

/**
 * Decorates the page object with custom assertions
 */
export const addAssertions = {
  page(page, _context, config) {
    const retrySettings = { ...DEFAULT_ASSERTIONS_CONFIG, ...config?.assertions }

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
