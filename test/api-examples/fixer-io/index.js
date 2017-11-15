import currencyFactory from './Currency'
import localDateFactory from './LocalDate'
import fixerIoResultFactory from './FixerIoResult'

export default ({M, m} = {}) => {
  const spec = {M, m}

  const Currency = currencyFactory(spec)
  const LocalDate = localDateFactory(spec)

  return Object.freeze({
    Currency,
    FixerIoResult: fixerIoResultFactory(spec, {Currency, LocalDate})
  })
}
