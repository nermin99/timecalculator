const operations = new Map([
  ['+', (op1, op2) => op1 + op2],
  ['-', (op1, op2) => op1 - op2],
  ['>', (op1, op2) => op2 - op1],
])

/**
 * Converts explicit time durations to seconds.
 * 1h - 20m + 10s ---> 3600 - 1200 + 10
 */
const timeDurationsToSeconds = (str) => {
  const rx = /(\d+h)?(\d+m)?(\d+s)?/g
  const matches = str.matchAll(rx)

  for (const [match, hours = 0, minutes = 0, seconds = 0] of matches) {
    if (match === '') continue

    str = str.replace(
      match,
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
    )
  }
  return str
}

/**
 * Converts time strokes (from midnight) to seconds.
 * 01:00 > 02:00 ---> 3600 > 7200
 */
const timeStrokesToSeconds = (str) => {
  const re = /(\d{2}):(\d{2}):?(\d{2})?/g

  const matches = str.matchAll(re)
  for (const [match, hours, minutes, seconds = 0] of matches) {
    str = str.replace(
      match,
      Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
    )
  }
  return str
}

// '3600 > 7200 + 7200 > 10800' --> '3600 + 3600'
export const replaceDurations = (str) => {
  const re = /(\d+)\s?(>)\s?(\d+)/g

  const matches = str.matchAll(re)
  for (const [match, op1, op, op2] of matches) {
    str = str.replace(match, operations.get(op)(op1, op2))
  }
  return str
}

// '3600 + 3600' --> 7200
export const evalStr = (str) => Function(`'use strict'; return (${str})`)()

/**
 * Evaluate an expression like
 * '3600 > 7200 + 7200 > 10800' --> 7200
 */
export const evaluate = (str) => {
  str = replaceDurations(str)
  return evalStr(str)
}

/**
 * Get the number of hours, minutes and seconds
 * from the total seconds.
 */
const secondsToTime = (seconds) => {
  const time = seconds
  let rem = time

  const times = {
    hour: Math.floor(rem / (60 * 60)) % 24,
    minute: Math.floor(time / 60) % 60,
    second: time % 60,
  }
  return times
}

/**
 * Check whether time stroke or elapsed time is calculated.
 * Is a time stroke if any time duration is added/subtracted to any time stroke.
 * Regex matches e.g '18:30 + 1h' but not e.g '2h - 30m' or '12:00 > 13:00'.
 */
export const isTimeStroke = (str) => {
  const reBase = '(\\d{2}):(\\d{2}):?(\\d{2})?'
  const reFront = new RegExp(`\\d+[hms]\\s?[+-]\\s?${reBase}`)
  const reBack = new RegExp(`${reBase}\\s?[+-]\\s?\\d+[hms]`)
  return reFront.test(str) || reBack.test(str)
}

const evaluateParentheses = (input) => {
  const rx = /(\([^(]*?\))/g

  const match = input.match(rx)?.[0]
  if (!match) return input

  const res = evaluate(timeDurationsToSeconds(timeStrokesToSeconds(match)))
  return evaluateParentheses(input.replace(match, res))
}

/**
 * Main function which takes the user input.
 */
export const evalExpr = (input) => {
  let str = input

  str = timeStrokesToSeconds(str)
  str = timeDurationsToSeconds(str)
  str = replaceDurations(str)
  try {
    str = evalStr(str)
  } catch (error) {
    str = 0
  }

  const seconds = str
  const times = secondsToTime(seconds)

  if (isTimeStroke(input)) {
    const [h, m, s] = Object.values(times).map((t) => (t < 10 ? `0${t}` : t))
    return `${h}:${m}` + (s === '00' ? '' : `:${s}`)
  } else {
    const [h, m, s] = Object.entries(times).map(([unit, val]) =>
      val === 0 ? '' : `${val} ${unit}${val === 1 ? '' : 's'}`
    )
    const result = [h, m, s].filter((str) => str !== '').join(' ')
    return result === '' ? '0 hours 0 minutes 0 seconds' : result
  }
}
