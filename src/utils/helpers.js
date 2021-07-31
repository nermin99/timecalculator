/**
 * Debounce function
 * @param {Function} fn to be debounced
 * @param {Number} delay time in milliseconds
 */
export function debounce(fn, delay) {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}
