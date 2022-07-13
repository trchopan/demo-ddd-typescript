import {ZodIssueCode} from 'zod'
import {ValueFailure} from '../core/ValueFailure'
import {BloodpressureValue, BloodpressureValueError} from './BloodpressureValue'

describe('domain/healthcare/Bloodpressure', () => {
  it('BloodpressureValue pass', () => {
    const bloodPressure = new BloodpressureValue({
      lower: 20,
      upper: 300,
    })
    expect(bloodPressure.getOrCrash().lower).toEqual(20)
    expect(bloodPressure.getOrCrash().upper).toEqual(300)
  })

  it('BloodpressureValue can equal', () => {
    expect(
      new BloodpressureValue({lower: 30, upper: 50}).equals(
        new BloodpressureValue({lower: 30, upper: 50})
      )
    ).toBeTruthy()

    expect(
      new BloodpressureValue({lower: 40, upper: 50}).equals(
        new BloodpressureValue({lower: 30, upper: 50})
      )
    ).toBeFalsy()
  })

  it('BloodpressureValue should throw too_big or too_small lower/upper', () => {
    const tooBigAndTooSmall = new BloodpressureValue({
      lower: 19,
      upper: 301,
    })
    expect(() => tooBigAndTooSmall.getOrCrash()).toThrowError(
      new ValueFailure(tooBigAndTooSmall, [
        {path: 'lower', code: ZodIssueCode.too_small, message: ''},
        {path: 'upper', code: ZodIssueCode.too_big, message: ''},
      ])
    )
  })

  it('BloodpressureValue should throw when lower > upper', () => {
    const lowerGreaterThanUpper = new BloodpressureValue({
      lower: 30,
      upper: 29,
    })
    expect(() => lowerGreaterThanUpper.getOrCrash()).toThrowError(
      new ValueFailure(lowerGreaterThanUpper, [
        {
          code: ZodIssueCode.custom,
          path: 'lower',
          message: BloodpressureValueError.LowerMustSmallerThanUpper,
        },
      ])
    )
  })

  it('BloodpressureValue should throw multiple error with custom', () => {
    const multipleError = new BloodpressureValue({
      lower: 301,
      upper: 29,
    })
    expect(() => multipleError.getOrCrash()).toThrowError(
      new ValueFailure(multipleError, [
        {
          path: 'lower',
          code: ZodIssueCode.too_big,
          message: '',
        },
        {
          path: 'lower',
          code: ZodIssueCode.custom,
          message: BloodpressureValueError.LowerMustSmallerThanUpper,
        },
      ])
    )
  })
})
