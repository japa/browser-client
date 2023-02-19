/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Assert } from '@japa/assert'
import type { BasePage } from './base_page'
import type { VisitOptions } from './types'
import { BaseInteraction } from './base_interaction'

/**
 * Types for custom methods
 */
declare module 'playwright' {
  export interface Page {
    assert: Assert

    /**
     * Use a page or an interaction to perform actions
     */
    use<T extends typeof BasePage | typeof BaseInteraction>(pageOrInteraction: T): InstanceType<T>

    /**
     * Pause page when condition is true
     */
    pauseIf(condition: boolean): Promise<void>

    /**
     * Pause page when condition is false
     */
    pauseUnless(condition: boolean): Promise<void>

    /**
     * Assert an element to exists
     */
    assertExists(selector: string): Promise<void>

    /**
     * Assert an element to not exist
     */
    assertNotExists(selector: string): Promise<void>

    /**
     * Assert an element to exists and have matching count
     */
    assertElementsCount(selector: string, expectedCount: number): Promise<void>

    /**
     * Assert an element to be visible. Elements with display: none
     * and visibility:hidden are not visible.
     */
    assertVisible(selector: string): Promise<void>

    /**
     * Assert an element to be not visible. Elements with display: none
     * and visibility:hidden are not visible.
     */
    assertNotVisible(selector: string): Promise<void>

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
     * Assert the page URL to contain the expected substring
     */
    assertUrlContains(expectedSubstring: string): Promise<void>

    /**
     * Assert the page URL to match regex
     */
    assertUrlMatches(regex: RegExp): Promise<void>

    /**
     * Assert the page path to match the expected value. The URL
     * is parsed using the Node.js URL parser and the pathname
     * value is used for assertion.
     */
    assertPath(expectedPathName: string): Promise<void>

    /**
     * Assert the page path to contain the expected substring. The URL
     * is parsed using the Node.js URL parser and the pathname value
     * is used for assertion.
     */
    assertPathContains(expectedSubstring: string): Promise<void>

    /**
     * Assert the page path to match the expected regex. The URL is
     * parsed using the Node.js URL parser and the pathname value
     * is used for assertion.
     */
    assertPathMatches(regex: RegExp): Promise<void>

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

    /**
     * Assert an element to be disabled. All elements are considered
     * enabled, unless it is a button, select, input or a textarea
     * with disabled attribute
     */
    assertDisabled(selector: string): Promise<void>

    /**
     * Assert an element to be not disabled. All elements are considered
     * enabled, unless it is a button, select, input or a textarea
     * with disabled attribute
     */
    assertNotDisabled(selector: string): Promise<void>

    /**
     * Assert the input value to match the expected value. The assertion
     * must be performed against an `input`, `textarea` or a `select`
     * dropdown.
     */
    assertInputValue(selector: string, expectedValue: string): Promise<void>

    /**
     * Assert the select box selected options to match the expected values.
     */
    assertSelectedOptions(selector: string, expectedValues: string[]): Promise<void>
  }

  export interface BrowserContext {
    /**
     * Open a new page and visit a URL
     */
    visit(url: string, options?: VisitOptions): Promise<Page>

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
