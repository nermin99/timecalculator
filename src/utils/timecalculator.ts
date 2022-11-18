// Matches time strokes on the form HH:MM and HH:MM:SS
const reStroke = '\\d{2}:\\d{2}(?::\\d{2})?'

const DAY_IN_SECONDS = 86400 // 24 * 60 * 60

/**
 * Remove all whitespace from string.
 */
export const strip = (str: string) => str.replace(/\s+/g, '')

/**
 * Get total number of seconds from hours, minutes, and seconds.
 * (1, 1, 0) -> 3660
 */
export const strTimeToSeconds = (hours: number, minutes: number, seconds: number) => {
  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Replaces time intervals with the time duration in seconds.
 * '01:00>02:00' -> '3600'
 */
export const replaceIntervals = (str: string) => {
  const reInterval = new RegExp(`(${reStroke})\\>(${reStroke})`, 'g')
  const matches = str.matchAll(reInterval)

  for (const [match, stroke1, stroke2] of matches) {
    const t1 = Number(replaceStrokes(stroke1))
    let t2 = Number(replaceStrokes(stroke2))
    if (t1 > t2) t2 += DAY_IN_SECONDS
    str = str.replace(match, (t2 - t1).toString())
  }
  return str
}

/**
 * Converts time strokes (from midnight) to seconds.
 * '01:30' -> '5400'
 */
export const replaceStrokes = (str: string) => {
  const re = /(\d{2}):(\d{2}):?(\d{2})?/g
  const matches = str.matchAll(re)

  for (const [match, hours, minutes, seconds = 0] of matches) {
    str = str.replace(
      match,
      strTimeToSeconds(Number(hours), Number(minutes), Number(seconds)).toString()
    )
  }
  return str
}

/**
 * Converts explicit time durations to seconds.
 * '1h30m20s' -> '5420'
 */
export const replaceDurations = (str: string) => {
  // https://stackoverflow.com/questions/72016685/matching-hour-minute-second-hms-duration-string
  const re = /\b(?=\w)(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?\b(?!\w)/g
  const matches = str.matchAll(re)

  for (const [match, hours = 0, minutes = 0, seconds = 0] of matches) {
    str = str.replace(
      match,
      strTimeToSeconds(Number(hours), Number(minutes), Number(seconds)).toString()
    )
  }
  return str
}

/**
 * Evaluate mathematical expressions.
 * '3600+3600' -> 7200
 */
export const evalStr = (str: string) => {
  const reWhiteList = /[hms\d\+\-\>\:\(\)]/g
  if (str.length !== str.match(reWhiteList)?.length) return 0 // only allow characters from whitelist

  str = str.replaceAll('--', '- -') // don't interpret as decrement operator
  try {
    return Function(`'use strict'; return (${str})`)()
  } catch (error) {
    return 0
  }
}

/**
 * Check whether time stroke or elapsed time is calculated.
 * Is a time stroke if any time duration is added/subtracted to any time stroke.
 * Regex matches e.g '18:30+1h' but not e.g '1h-30m' or '12:00>13:00'.
 */
export const isTimeStroke = (str: string) => {
  const reFront = new RegExp(`\\d+[hms][+-]+${reStroke}`)
  const reBack = new RegExp(`${reStroke}[+-]+\\d+[hms]`)
  return reFront.test(str) || reBack.test(str)
}

/**
 * Converts total seconds (from midnight) to time stroke on the form HH:MM or HH:MM:SS.
 * 3660 -> '01:01'
 */
export const secondsToStroke = (seconds: number) => {
  seconds = Math.abs(Number(seconds)) // can only deal with positive numbers
  const hhmmss = new Date(seconds * 1000).toISOString().slice(11, 19)
  const hhmm = hhmmss.slice(0, -3)
  return hhmmss.slice(-2) === '00' ? hhmm : hhmmss
}

/**
 * Converts total seconds (from midnight) to time duration on the form hms.
 * 3620 -> '1h20s'
 */
export const secondsToDuration = (seconds: number) => {
  const re = /(?<h>\d{2}):(?<m>\d{2}):?(?<s>\d{2})?/g
  const stroke = secondsToStroke(seconds)

  const match = re.exec(stroke)
  const str = Object.entries(match?.groups ?? [])
    .filter(([, val]) => val && val !== '00')
    .reduce((acc, [unit, val]) => acc + Number(val) + unit, '')
  return seconds < 0 ? '-' + str : str
}

/**
 * Convert total seconds (from midnight) to representable output string.
 * 3620 -> '1 hour 20 seconds'
 */
export const secondsToOutput = (seconds: number) => {
  const stroke = secondsToStroke(seconds)
  const [hour, minute, second = 0] = stroke.split(':').map(Number)

  let str = Object.entries({ hour, minute, second })
    .filter(([, val]) => val !== 0)
    .reduce((acc, [unit, val]) => `${acc} ${val} ${unit}${Math.abs(val) === 1 ? '' : 's'}`, '')
    .trim()
  if (seconds < 0) str = '-' + str
  return str === '' ? '0 hours 0 minutes 0 seconds' : str
}

/**
 * Evaluates all (nested) parentheses and replaces them with their evaluated value.
 * '(1h30m+01:00)' -> '02:30'
 */
export const replaceParentheses = (input: string): string => {
  const re = /\([^(]*?\)/g
  const match = input.match(re)?.[0]
  if (!match) return input

  const res = evaluateInput(match)
  return replaceParentheses(input.replace(match, res))
}

/**
 * Evaluates any input which has been stripped from spaces.
 * '9h-12:30>13:00' -> '8 hours 30 minutes'
 */
export const evaluateInput = (input: string, isOutput = false) => {
  const str1 = replaceIntervals(input) // also used to determine if input is time stroke.
  const str2 = replaceStrokes(str1)
  const str3 = replaceDurations(str2)
  const seconds = evalStr(str3)

  if (isTimeStroke(str1)) {
    return secondsToStroke(seconds)
  } else {
    return isOutput ? secondsToOutput(seconds) : secondsToDuration(seconds)
  }
}

/**
 * Main function which takes the user input and returns the evaluated expression.
 */
export const handleInput = (input: string) => {
  const strippedInput = strip(input)
  const preparedInput = replaceParentheses(strippedInput)
  return evaluateInput(preparedInput, true)
}
