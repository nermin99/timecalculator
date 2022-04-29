// Matches time strokes on the form HH:MM and HH:MM:SS
const reStroke = '\\d{2}:\\d{2}(?::\\d{2})?'

/* Remove all whitespace from string */
export const strip = (str) => str.replace(/\s+/g, '')

/**
 * Get total number of seconds from hours, minutes, and seconds.
 * ('1', '1', 0) --> 3660
 */
export const strTimeToSeconds = (hours, minutes, seconds) => {
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}

export const secondsToOutput = (seconds) => {
  const stroke = secondsToStroke(seconds)
  const [hour, minute, second = 0] = stroke.split(':').map(Number)
  const str = Object.entries({ hour, minute, second })
    .filter(([, val]) => val !== 0)
    .reduce((acc, [unit, val]) => `${acc} ${val} ${unit}${Math.abs(val) === 1 ? '' : 's'}`, '')
    .trim()
  return str === '' ? '0 hours 0 minutes 0 seconds' : str
}

/**
 * Converts total seconds (from midnight) to time duration on the form hms.
 * 3620 --> '1h20s'
 */
export const secondsToHMS = (seconds) => {
  const re = /(?<h>\d{2}):(?<m>\d{2}):?(?<s>\d{2})?/g
  const stroke = secondsToStroke(seconds)

  const match = re.exec(stroke)
  const str = Object.entries(match.groups)
    .filter(([, val]) => val && val !== '00')
    .reduce((acc, [unit, val]) => acc + Number(val) + unit, '')
  return str
}

/**
 * Get the number of hours, minutes and seconds from the total seconds.
 * 3670 --> { hour: 1, minute: 1, second: 10 }
 */
export const secondsToDuration = (seconds = 0) => {
  const negative = seconds < 0
  if (negative) seconds = Math.abs(seconds)

  const obj = {
    hour: Math.floor(seconds / 3600) % 24,
    minute: Math.floor(seconds / 60) % 60,
    second: seconds % 60,
  }
  if (negative) {
    if (obj.hour !== 0) obj.hour = -obj.hour
    if (obj.hour === 0 && obj.minute !== 0) obj.minute = -obj.minute
    if (obj.hour === 0 && obj.minute === 0 && obj.second !== 0) obj.second = -obj.second
  }
  return obj
}

/**
 * Converts total seconds (from midnight) to time stroke on the form
 * HH:MM or HH:MM:SS.
 * 3660 --> '01:01'
 */
export const secondsToStroke = (seconds) => {
  const hhmmss = new Date(Number(seconds) * 1000).toISOString().slice(11, 19)
  const hhmm = hhmmss.slice(0, -3)
  return hhmmss.slice(-2) === '00' ? hhmm : hhmmss
}

/**
 * Convert time duration to representable output string.
 * { hour: 1, minute: 0, second: 20 } --> '1 hour 20 seconds'
 */
export const durationToOutput = (durationObj) => {
  const str = Object.entries(durationObj)
    .filter(([, val]) => val !== 0)
    .reduce((acc, [unit, val]) => `${acc} ${val} ${unit}${Math.abs(val) === 1 ? '' : 's'}`, '')
    .trim()
  return str === '' ? '0 hours 0 minutes 0 seconds' : str
}

/**
 * Convert time duration to string on format hms.
 * { hour: 1, minute: 0, second: 20 } --> '1h20s'
 */
export const durationToHMS = (durationObj) => {
  const str = Object.entries(durationObj)
    .filter(([, val]) => val !== 0)
    .reduce((acc, [unit, val]) => `${acc}${val}${unit[0]}`, '')
  return str
}

/**
 * Replaces time intervals with the time duration in seconds.
 * '01:00>02:00' --> '3600'
 */
export const replaceIntervals = (str) => {
  const reInterval = `(${reStroke})\\>(${reStroke})`

  const matches = str.matchAll(reInterval)
  for (const [match, stroke1, stroke2] of matches) {
    const t1 = replaceStrokes(stroke1)
    const t2 = replaceStrokes(stroke2)
    str = str.replace(match, Number(t2) - Number(t1))
  }
  return str
}

/**
 * Converts time strokes (from midnight) to seconds.
 * '01:30' --> '5400'
 */
export const replaceStrokes = (str) => {
  const re = /(\d{2}):(\d{2}):?(\d{2})?/g

  const matches = str.matchAll(re)
  for (const [match, hours, minutes, seconds = 0] of matches) {
    str = str.replace(match, strTimeToSeconds(hours, minutes, seconds))
  }
  return str
}

/**
 * Converts explicit time durations to seconds.
 * '1h30m20s' --> '5420'
 */
export const replaceDurations = (str) => {
  // https://stackoverflow.com/questions/72016685/matching-hour-minute-second-hms-duration-string
  const re = /\b(?=\w)(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?\b(?!\w)/g

  const matches = str.matchAll(re)
  for (const [match, hours = 0, minutes = 0, seconds = 0] of matches) {
    str = str.replace(match, strTimeToSeconds(hours, minutes, seconds))
  }
  return str
}

/**
 * Check whether time stroke or elapsed time is calculated.
 * Is a time stroke if any time duration is added/subtracted to any time stroke.
 * Regex matches e.g '18:30+1h' but not e.g '1h-30m' or '12:00>13:00'.
 */
export const isTimeStroke = (str) => {
  const reFront = new RegExp(`\\d+[hms][+-]+${reStroke}`)
  const reBack = new RegExp(`${reStroke}[+-]+\\d+[hms]`)
  return reFront.test(str) || reBack.test(str)
}

/**
 * Evaluate mathematical expressions.
 * '3600+3600' --> 7200
 */
export const evalStr = (str) => {
  const reWhiteList = /[hms\d\+\-\>\:\(\)]/g
  if (str.length !== str.match(reWhiteList).length) return 0 // only allow characters from whitelist
  str = str.replaceAll('--', '- -') // don't interpret as decrement operator
  return Function(`'use strict'; return (${str})`)()
}

export const evaluate = (str) => {
  const str1 = replaceIntervals(str)
  const str2 = replaceStrokes(str1)
  const str3 = replaceDurations(str2)
  const str4 = evalStr(str3)
  if (isTimeStroke(str1)) {
    return secondsToStroke(str4)
  } else {
    return durationToHMS(secondsToDuration(str4))
  }
}

export const evaluateParentheses = (input) => {
  const re = /\([^(]*?\)/g

  const match = input.match(re)?.[0]
  if (!match) return input

  const res = evaluate(match)
  return evaluateParentheses(input.replace(match, res))
}

/**
 * Main function which takes the user input.
 */
export const evalExpr = (input) => {
  const strippedInput = strip(input)
  const preparedInput = evaluateParentheses(strippedInput)
  const parsedInput = replaceIntervals(preparedInput)
  const strokesReplaced = replaceStrokes(parsedInput)
  const durationsReplaced = replaceDurations(strokesReplaced)

  let seconds
  try {
    seconds = evalStr(durationsReplaced)
  } catch (error) {
    console.error(error)
    seconds = 0
  }

  if (isTimeStroke(parsedInput)) {
    return secondsToStroke(seconds)
  } else {
    const duration = secondsToDuration(seconds)
    return durationToOutput(duration)
  }
}
