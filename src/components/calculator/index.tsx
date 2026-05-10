import React, { useState, ChangeEvent } from 'react'
import { handleInput } from '../../utils/timecalculator'
import { debounce } from '../../utils/helpers'

import './index.css'

const DEBOUNCE_DELAY = 500

const Calculator = () => {
  const [result, setResult] = useState('')
  const [dayOffset, setDayOffset] = useState(0)

  const handleEvent = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    if (input === '') {
      setResult('')
      setDayOffset(0)
    } else {
      const { result, dayOffset } = handleInput(input)
      setResult(result)
      setDayOffset(dayOffset)
    }
  }, DEBOUNCE_DELAY)

  const dayOffsetLabel =
    dayOffset !== 0
      ? `(${dayOffset > 0 ? '+' : '-'} ${Math.abs(dayOffset)} ${Math.abs(dayOffset) === 1 ? 'day' : 'days'})`
      : null

  return (
    <div className="calculator">
      <div className="result-area">
        <div className="result">{result}</div>
        <div className="day-offset">{dayOffsetLabel}</div>
      </div>
      <form className="calculator-form" onSubmit={(e) => e.preventDefault()}>
        <input
          onChange={handleEvent}
          className="input"
          type="text"
          autoComplete="off"
          placeholder="08:00 > 17:00"
          autoFocus
        />
      </form>
    </div>
  )
}

export default Calculator
