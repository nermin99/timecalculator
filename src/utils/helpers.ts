/**
 * Debounce function
 * @param fn to be debounced
 * @param delay time in milliseconds
 */
export const debounce = (fn: Function, delay: number) => {
  let timer: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    const context = this
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}

/**
 * Modulo function
 * a % n
 */
export const mod = (a: number, n: number) => ((a % n) + n) % n
