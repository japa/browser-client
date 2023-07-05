/*
 * @japa/browser-client
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Checks if one object is a subset of an another object
 */
export const isSubsetOf = (superset: Record<string, any>, subset: Record<string, any>): boolean => {
  if (
    typeof superset !== 'object' ||
    superset === null ||
    typeof subset !== 'object' ||
    subset === null
  ) {
    return false
  }

  return Object.keys(subset).every((key) => {
    if (!superset.propertyIsEnumerable(key)) {
      return false
    }

    const subsetItem = subset[key]
    const supersetItem = superset[key]

    if (typeof subsetItem === 'object' && subsetItem !== null) {
      return isSubsetOf(supersetItem, subsetItem)
    }
    if (supersetItem !== subsetItem) {
      return false
    }
    return true
  })
}
