/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import qs from 'qs'
import type { Decorator } from '../types'

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

    page.assertNotExists = async function (selector) {
      const matchingCount = await this.locator(selector).count()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(matchingCount === 0, 'expected #{this} element to not exist', {
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

    page.assertVisible = async function (selector) {
      const isVisible = await this.locator(selector).isVisible()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(isVisible, 'expected #{this} element to be visible', {
        thisObject: selector,
        actual: '',
        expected: '',
        showDiff: false,
        operator: 'strictEqual',
      })
    }

    page.assertNotVisible = async function (selector) {
      const isVisible = await this.locator(selector).isVisible()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(!isVisible, 'expected #{this} element to be not visible', {
        thisObject: selector,
        actual: '',
        expected: '',
        showDiff: false,
        operator: 'strictEqual',
      })
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

    page.assertUrlContains = async function (expectedSubstring) {
      const pageURL = this.url()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(
        pageURL.includes(expectedSubstring),
        'expected page URL to include #{exp}',
        {
          actual: pageURL,
          expected: expectedSubstring,
          showDiff: false,
          operator: 'strictEqual',
        }
      )
    }

    page.assertUrlMatches = async function (regex) {
      const pageURL = this.url()

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(regex.test(pageURL), 'expected page URL to match #{exp}', {
        actual: pageURL,
        expected: regex,
        showDiff: false,
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

    page.assertPathContains = async function (expectedSubstring) {
      const pageURL = new URL(this.url())

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(
        pageURL.pathname.includes(expectedSubstring),
        'expected page path to include #{exp}',
        {
          actual: pageURL.pathname,
          expected: expectedSubstring,
          showDiff: false,
          operator: 'strictEqual',
        }
      )
    }

    page.assertPathMatches = async function (regex) {
      const pageURL = new URL(this.url())

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(regex.test(pageURL.pathname), 'expected page path to match #{exp}', {
        actual: pageURL.pathname,
        expected: regex,
        showDiff: false,
        operator: 'strictEqual',
      })
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

    page.assertText = async function (selector, expectedValue) {
      this.assert.incrementAssertionsCount()

      const actual = await this.locator(selector).innerText({ timeout: 2000 })
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

    page.assertElementsText = async function (selector, expectedValues) {
      const innertTexts = await this.locator(selector).allInnerTexts()
      this.assert.deepEqual(innertTexts, expectedValues)
    }

    page.assertTextContains = async function (selector, expectedSubstring) {
      this.assert.incrementAssertionsCount()

      const actual = await this.locator(selector).innerText({ timeout: 2000 })
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

    page.assertChecked = async function (selector) {
      let isChecked: boolean | undefined

      try {
        isChecked = await this.locator(selector).isChecked({ timeout: 2000 })
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

    page.assertNotChecked = async function (selector) {
      let isChecked: boolean | undefined

      try {
        isChecked = await this.locator(selector).isChecked({ timeout: 2000 })
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

    page.assertDisabled = async function (selector) {
      const isDisabled = await this.locator(selector).isDisabled({ timeout: 2000 })

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(isDisabled, 'expected #{this} element to be disabled', {
        thisObject: selector,
        actual: '',
        expected: '',
        showDiff: false,
        operator: 'strictEqual',
      })
    }

    page.assertNotDisabled = async function (selector) {
      const isDisabled = await this.locator(selector).isDisabled({ timeout: 2000 })

      this.assert.incrementAssertionsCount()
      this.assert.evaluate(!isDisabled, 'expected #{this} element to be not disabled', {
        thisObject: selector,
        actual: '',
        expected: '',
        showDiff: false,
        operator: 'strictEqual',
      })
    }

    page.assertInputValue = async function (selector, expectedValue) {
      let inputValue: string | undefined

      try {
        inputValue = await this.locator(selector).inputValue({ timeout: 2000 })
      } catch (error) {
        if (error.message.includes('Node is not')) {
          this.assert.incrementAssertionsCount()
          this.assert.evaluate(
            false,
            'expected #{this} element to be an input, select or a textarea',
            {
              thisObject: selector,
              actual: inputValue,
              expected: expectedValue,
              showDiff: false,
              operator: 'strictEqual',
            }
          )
          return
        }

        throw error
      }

      if (inputValue !== undefined) {
        this.assert.incrementAssertionsCount()
        this.assert.evaluate(
          inputValue === String(expectedValue),
          'expected #{this} value to be equal #{exp}',
          {
            thisObject: selector,
            actual: inputValue,
            expected: String(expectedValue),
            showDiff: true,
            operator: 'strictEqual',
          }
        )
      }
    }

    page.assertSelectedOptions = async function (selector, expectedValues) {
      const element = await this.$eval(selector, (node) => {
        /* c8 ignore start */
        if (node.nodeName === 'SELECT') {
          const options = new Array(...node.options)
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
        this.assert.incrementAssertionsCount()
        this.assert.evaluate(false, 'expected #{this} element to be a select box', {
          thisObject: selector,
          actual: '',
          expected: '',
          showDiff: false,
          operator: 'strictEqual',
        })

        return
      }

      /**
       * Using different assertions for multiple and single
       * select boxes
       */
      if (element.multiple) {
        this.assert.sameMembers(element.selected, expectedValues)
      } else {
        this.assert.incrementAssertionsCount()
        this.assert.evaluate(
          element.selected[0] === expectedValues[0],
          'expected #{this} value to equal #{exp}',
          {
            thisObject: selector,
            actual: element.selected[0],
            expected: expectedValues[0],
            showDiff: true,
            operator: 'strictEqual',
          }
        )
      }
    }
  },
} satisfies Decorator
