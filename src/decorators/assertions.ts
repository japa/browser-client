/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import qs from 'qs'
import { inspect } from 'node:util'
import { AssertionError } from 'node:assert'
import type { Locator, Page } from 'playwright'

import type { Decorator } from '../types/main.js'
import { isSubsetOf } from '../helpers.js'

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
  page(page) {
    page.assertExists = async function assertExists(selector) {
      const matchingCount = await getLocator(selector, this).count()

      if (matchingCount <= 0) {
        throw new AssertionError({
          message: `expected ${inspect(selector)} element to exist`,
          stackStartFn: assertExists,
        })
      }
    }

    page.assertNotExists = async function assertNotExists(selector) {
      const matchingCount = await getLocator(selector, this).count()

      if (matchingCount !== 0) {
        throw new AssertionError({
          message: `expected ${inspect(selector)} element to not exist`,
          stackStartFn: assertNotExists,
        })
      }
    }

    page.assertElementsCount = async function assertElementsCount(selector, expectedCount) {
      const matchingCount = await getLocator(selector, this).count()

      if (matchingCount !== expectedCount) {
        throw new AssertionError({
          message: `expected ${inspect(selector)} to have '${expectedCount}' elements`,
          stackStartFn: assertElementsCount,
          actual: matchingCount,
          expected: expectedCount,
        })
      }
    }

    page.assertVisible = async function assertVisible(selector) {
      const isVisible = await getLocator(selector, this).isVisible()

      if (!isVisible) {
        throw new AssertionError({
          message: `expected ${inspect(selector)} element to be visible`,
          stackStartFn: assertVisible,
        })
      }
    }

    page.assertNotVisible = async function assertNotVisible(selector) {
      const isVisible = await getLocator(selector, this).isVisible()

      if (isVisible) {
        throw new AssertionError({
          message: `expected ${inspect(selector)} element to be not visible`,
          stackStartFn: assertNotVisible,
        })
      }
    }

    page.assertTitle = async function assertTitle(expectedTitle) {
      const pageTitle = await this.title()

      if (pageTitle !== expectedTitle) {
        throw new AssertionError({
          message: `expected page title '${pageTitle}' to equal '${expectedTitle}'`,
          stackStartFn: assertTitle,
          actual: pageTitle,
          expected: expectedTitle,
        })
      }
    }

    page.assertTitleContains = async function assertTitleContains(expectedSubstring) {
      const pageTitle = await this.title()

      if (!pageTitle.includes(expectedSubstring)) {
        throw new AssertionError({
          message: `expected page title '${pageTitle}' to include '${expectedSubstring}'`,
          stackStartFn: assertTitleContains,
        })
      }
    }

    page.assertUrl = async function assertUrl(expectedUrl) {
      const pageURL = this.url()

      if (pageURL !== expectedUrl) {
        throw new AssertionError({
          message: `expected page URL '${pageURL}' to equal '${expectedUrl}'`,
          stackStartFn: assertUrl,
          actual: pageURL,
          expected: expectedUrl,
        })
      }
    }

    page.assertUrlContains = async function assertUrlContains(expectedSubstring) {
      const pageURL = this.url()

      if (!pageURL.includes(expectedSubstring)) {
        throw new AssertionError({
          message: `expected page URL '${pageURL}' to include '${expectedSubstring}'`,
          stackStartFn: assertUrlContains,
        })
      }
    }

    page.assertUrlMatches = async function assertUrlMatches(regex) {
      const pageURL = this.url()

      if (!regex.test(pageURL)) {
        throw new AssertionError({
          message: `expected page URL '${pageURL}' to match '${regex}'`,
          stackStartFn: assertUrlMatches,
        })
      }
    }

    page.assertPath = async function assertPath(expectedPathName) {
      const { pathname } = new URL(this.url())

      if (pathname !== expectedPathName) {
        throw new AssertionError({
          message: `expected page pathname '${pathname}' to equal '${expectedPathName}'`,
          stackStartFn: assertPath,
          actual: pathname,
          expected: expectedPathName,
        })
      }
    }

    page.assertPathContains = async function assertPathContains(expectedSubstring) {
      const { pathname } = new URL(this.url())

      if (!pathname.includes(expectedSubstring)) {
        throw new AssertionError({
          message: `expected page pathname '${pathname}' to include '${expectedSubstring}'`,
          stackStartFn: assertPathContains,
        })
      }
    }

    page.assertPathMatches = async function assertPathMatches(regex) {
      const { pathname } = new URL(this.url())

      if (!regex.test(pathname)) {
        throw new AssertionError({
          message: `expected page pathname '${pathname}' to match '${regex}'`,
          stackStartFn: assertPathMatches,
        })
      }
    }

    page.assertQueryString = async function assertQueryString(expectedSubset) {
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
    }

    page.assertCookie = async function assertCookie(cookieName, value?) {
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
    }

    page.assertCookieMissing = async function assertCookieMissing(cookieName) {
      const pageCookies = await this.context().cookies()
      const matchingCookie = pageCookies.find(({ name }) => name === cookieName)

      if (matchingCookie) {
        throw new AssertionError({
          message: `expected '${cookieName}' cookie to not exist`,
          stackStartFn: assertCookieMissing,
        })
      }
    }

    page.assertText = async function assertText(selector, expectedValue) {
      const actual = await getLocator(selector, this).innerText({ timeout: 2000 })
      if (actual !== expectedValue) {
        throw new AssertionError({
          message: `expected ${inspect(selector)} inner text to equal '${expectedValue}'`,
          stackStartFn: assertText,
          actual: actual,
          expected: expectedValue,
        })
      }
    }

    page.assertElementsText = async function assertElementsText(selector, expectedValues) {
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
    }

    page.assertTextContains = async function assertTextContains(selector, expectedSubstring) {
      const actual = await getLocator(selector, this).innerText({ timeout: 2000 })

      if (!actual.includes(expectedSubstring)) {
        throw new AssertionError({
          message: `expected ${inspect(selector)} inner text to include '${expectedSubstring}'`,
          stackStartFn: assertTextContains,
        })
      }
    }

    page.assertChecked = async function assertChecked(selector) {
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
    }

    page.assertNotChecked = async function assertNotChecked(selector) {
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
    }

    page.assertDisabled = async function assertDisabled(selector) {
      const isDisabled = await getLocator(selector, this).isDisabled({ timeout: 2000 })

      if (!isDisabled) {
        throw new AssertionError({
          message: `expected ${inspect(selector)} element to be disabled`,
          stackStartFn: assertDisabled,
        })
      }
    }

    page.assertNotDisabled = async function assertNotDisabled(selector) {
      const isDisabled = await getLocator(selector, this).isDisabled({ timeout: 2000 })

      if (isDisabled) {
        throw new AssertionError({
          message: `expected ${inspect(selector)} element to be not disabled`,
          stackStartFn: assertNotDisabled,
        })
      }
    }

    page.assertInputValue = async function assertInputValue(selector, expectedValue) {
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
    }

    page.assertSelectedOptions = async function assertSelectedOptions(selector, expectedValues) {
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
    }
  },
} satisfies Decorator
