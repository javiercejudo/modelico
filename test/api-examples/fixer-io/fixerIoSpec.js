/* eslint-env mocha */

const json = `
{
  "base": "EUR",
  "date": "2017-03-02",
  "rates": {
    "AUD": 1.384,
    "BGN": 1.9558,
    "BRL": 3.2687,
    "CAD": 1.4069,
    "CHF": 1.0651,
    "CNY": 7.2399,
    "CZK": 27.021,
    "DKK": 7.4336,
    "GBP": 0.8556,
    "HKD": 8.1622,
    "HRK": 7.4193,
    "HUF": 308.33,
    "IDR": 14045,
    "ILS": 3.881,
    "INR": 70.2,
    "JPY": 120.24,
    "KRW": 1204.3,
    "MXN": 20.95,
    "MYR": 4.6777,
    "NOK": 8.883,
    "NZD": 1.4823,
    "PHP": 52.997,
    "PLN": 4.2941,
    "RON": 4.522,
    "RUB": 61.68,
    "SEK": 9.5195,
    "SGD": 1.484,
    "THB": 36.804,
    "TRY": 3.8972,
    "USD": 1.0514,
    "ZAR": 13.78
  }
}
`

export default (should, M, {fixerIoFactory}, {Ajv}) => () => {
  const {_} = M.metadata()
  const {FixerIoResult, Currency} = fixerIoFactory({M, Ajv})

  it('should parse results from fixer.io', () => {
    const fixerIoResult = M.fromJSON(FixerIoResult, json)

    fixerIoResult.base().should.be.exactly(Currency.EUR())

    fixerIoResult.date().year().should.be.exactly(2017)
    fixerIoResult.date().month().should.be.exactly(3)
    fixerIoResult.date().day().should.be.exactly(2)

    fixerIoResult.rates().get(Currency.AUD()).should.be.exactly(1.384)
  })

  it('should convert between any available currencies', () => {
    const {GBP, USD, EUR, AUD, CNY} = Currency

    const fixerIoResult = M.fromJSON(FixerIoResult, json)

    fixerIoResult
      .convert(GBP(), USD(), 7.20)
      .toFixed(2)
      .should.be.exactly('8.85')

    fixerIoResult
      .convert(EUR(), AUD(), 15)
      .toFixed(2)
      .should.be.exactly('20.76')

    fixerIoResult
      .convert(CNY(), EUR(), 500)
      .toFixed(2)
      .should.be.exactly('69.06')
  })

  it('should generate the right schema', () => {
    const schema = M.getSchema(_(FixerIoResult))

    const expectedSchema = {
      type: 'object',
      properties: {
        base: {
          $ref: '#/definitions/2'
        },
        date: {
          $ref: '#/definitions/3'
        },
        rates: {
          $ref: '#/definitions/4'
        }
      },
      required: ['base', 'date', 'rates'],
      definitions: {
        '2': {
          enum: [
            'AUD',
            'BGN',
            'BRL',
            'CAD',
            'CHF',
            'CNY',
            'CZK',
            'DKK',
            'EUR',
            'GBP',
            'HKD',
            'HRK',
            'HUF',
            'IDR',
            'ILS',
            'INR',
            'JPY',
            'KRW',
            'MXN',
            'MYR',
            'NOK',
            'NZD',
            'PHP',
            'PLN',
            'RON',
            'RUB',
            'SEK',
            'SGD',
            'THB',
            'TRY',
            'USD',
            'ZAR'
          ]
        },
        '3': {
          type: 'string',
          pattern: '^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$'
        },
        '4': {
          type: 'object',
          maxProperties: 32,
          additionalProperties: false,
          patternProperties: {
            '^(AUD|BGN|BRL|CAD|CHF|CNY|CZK|DKK|EUR|GBP|HKD|HRK|HUF|IDR|ILS|INR|JPY|KRW|MXN|MYR|NOK|NZD|PHP|PLN|RON|RUB|SEK|SGD|THB|TRY|USD|ZAR)$': {
              $ref: '#/definitions/5'
            }
          }
        },
        '5': {
          type: 'number',
          exclusiveMinimum: 0
        }
      }
    }

    schema.should.deepEqual(expectedSchema)

    Ajv().validate(schema, JSON.parse(json)).should.be.exactly(true)
  })
}
