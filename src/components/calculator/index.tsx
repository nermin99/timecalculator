import React, { useState } from 'react'
import { evalExpr } from 'src/utils/timecalculator'
import { debounce } from 'src/utils/helpers'

import './index.css'

const DEBOUNCE_DELAY = 500

const Calculator = () => {
  const [result, setResult] = useState('')

  const handleEvent = debounce((e: any) => {
    if (e.type === 'submit') e.preventDefault()

    const input = e.target.value

    const result = evalExpr(input)
    const output = input === '' ? '' : result

    setResult(output)
  }, DEBOUNCE_DELAY)

  return (
    <div className="calculator">
      <form className="calculator-form">
        <input
          onKeyUp={handleEvent}
          className="input"
          type="text"
          autoComplete="off"
          placeholder="08:00 > 17:00"
          autoFocus
        />
      </form>
      <div className="result">{result}</div>
    </div>
  )
}

export default Calculator
