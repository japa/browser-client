# @japa/browser-client
> Browser client to write end to end browser tests. Uses playwright under the hood

[![github-actions-image]][github-actions-url] [![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

The browser client of Japa is built on top of [Playwright library](https://playwright.dev/docs/library) and integrates seamlessly with the Japa test runner. Following are some reasons to use this plugin over manually interacting with the Playwright API.

- Automatic management of browsers and browser contexts.
- Built-in assertions.
- Ability to extend the `browser`, `context`, and `page` objects using [decorators](#decorators).
- Class-based pages and interactions to de-compose the page under test into smaller and reusable components.
- Toggle headless mode, tracing, and browsers using CLI flags.

#### [Complete documentation](https://japa.dev/docs/plugins/browser-client)

## Installation
Install the package from the npm registry as follows:

```sh
npm i -D playwright @japa/browser-client

yarn add -D playwright @japa/browser-client
```

## Usage
You can use the browser client package with the `@japa/runner` as follows.

```ts
import { assert } from '@japa/assert'
import { browserClient } from '@japa/browser-client'
import { configure, processCliArgs } from '@japa/runner'

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    plugins: [
      assert(),
      browserClient({
        runInSuites: ['browser']
      })
    ]
  }
})
```

Once done, you will be able to access the `visit`, `browser` and `browserContext` property from the test context.

```ts
test('test title', ({ browser, browserContext, visit }) => {
  // Create new page
  const page = await browserContext.newPage()
  await page.goto(url)

  // Or use visit helper
  const page = await visit(url)

  // Create multiple contexts
  const context1 = await browser.newContext()
  const context2 = await browser.newContext()
})
```

[gh-workflow-image]: https://img.shields.io/github/actions/workflow/status/japa/browser-client/test.yml?style=for-the-badge
[gh-workflow-url]: https://github.com/japa/browser-client/actions/workflows/test.yml 'Github action'
[npm-image]: https://img.shields.io/npm/v/@japa/browser-client/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@japa/browser-client/v/latest 'npm'
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/japa/browser-client?style=for-the-badge
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/japa/browser-client?label=Snyk%20Vulnerabilities&style=for-the-badge
[snyk-url]: https://snyk.io/test/github/japa/browser-client?targetFile=package.json 'snyk'
