const operations = new Map([
  ['+', (op1, op2) => op1 + op2],
  ['-', (op1, op2) => op1 - op2],
  ['>', (op1, op2) => op2 - op1],
])

const operationsStr = [...operations.keys()].join('') // +->

/**
 * Converts explicit time durations to seconds.
 * 1h - 20m + 10s ---> 3600 - 1200 + 10
 */
const replaceDurations = (str) => {
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
 * Converts timestrokes (from midnight) to seconds.
 * 05:00 > 13:00 ---> 18000 > 46800
 */
const replaceTimes = (str) => {
  const rx = /(\d{2}):(\d{2}):?(\d{2})?/g
  const matches = str.matchAll(rx)

  for (const [match, hours, minutes, seconds = 0] of matches) {
    str = str.replace(
      match,
      Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
    )
  }
  return str
}

/**
 * Evaluate an expression like
 * 3600 > 10800 --> 10800 - 3600 = 7200
 */
const evaluate = (expression) => {
  // eslint-disable-next-line
  const rx = /(\d+)\s?([\+\-\>])\s?(\d+)/g

  let str = `${expression}`.replace('(', '').replace(')', '')
  const match = rx.exec(str)

  if (match) {
    let [toReplace, op1, op, op2] = match
    op1 = Number(op1)
    op2 = Number(op2)

    str = str.replace(toReplace, operations.get(op)(op1, op2))

    return evaluate(str)
  } else {
    return Number(str)
  }
}

/**
 * Get the number of hours, minutes and seconds
 * from the total seconds.
 */
const secondsToTime = (seconds) => {
  const time = seconds
  let rem = time

  const times = {
    hour: Math.floor(rem / (60 * 60)),
    minute: Math.floor(time / 60) % 60,
    second: time % 60,
  }
  return times
}

/**
 * Chech whether timestroke or elapsed time is calculated.
 * If '>' is in expression, not a timestroke.
 * Regex matches e.g '18:30 + 1h' but not e.g '2h - 30m'.
 * TODO: match e.g '1h + 18:30'
 */
const checkTimeStroke = (expr) => {
  let flag = !expr.includes('>') //
  flag = flag && /\d+\s?[+-]\s?\d+[hms]/g.test(expr)
  return flag
}

export const evalExpr = (input) => {
  // const rx = /\(.+?\)/g
  const enclosedExprRegex = new RegExp(`\\([\\d${operationsStr} ]+\\)`, 'g')

  let currExpr = replaceTimes(replaceDurations(input))
  let match = currExpr.match(enclosedExprRegex)

  while (match) {
    currExpr = currExpr.replace(match[0], evaluate(match[0]))
    match = currExpr.match(enclosedExprRegex)
  }

  const seconds = evaluate(currExpr)
  const times = secondsToTime(seconds)

  const isTimeStroke = checkTimeStroke(input)

  if (isTimeStroke) {
    const [h, m, s] = Object.values(times).map((t) => (t < 10 ? `0${t}` : t))
    return `${h}:${m}` + (s === '00' ? '' : `:${s}`)
  } else {
    const [h, m, s] = Object.entries(times).map(([unit, val]) =>
      val === 0 ? '' : `${val} ${unit}${val === 1 ? '' : 's'} `
    )
    const result = h + m + s
    return result === '' ? '0 hours 0 minutes 0 seconds' : result
  }
}
