/**
 * Debounce function
 * @param fn to be debounced
 * @param delay time in milliseconds
 */
export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<F>): void => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Modulo function
 * a % n
 */
export const mod = (a: number, n: number) => ((a % n) + n) % n
