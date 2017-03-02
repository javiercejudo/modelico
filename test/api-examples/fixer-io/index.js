import currencyFactory from './Currency'
import localDateFactory from './LocalDate'
import fixerIoResultFactory from './FixerIoResult'

export default ({
  M,
  Ajv,
  ajvOptions = {},
  validationEnabled = true
} = {}) => {
  const options = {M, Ajv, ajvOptions, validationEnabled}
  const Currency = currencyFactory({M})
  const LocalDate = localDateFactory(options)

  return Object.freeze({
    Currency,
    FixerIoResult: fixerIoResultFactory(options, [Currency, LocalDate])
  })
}
