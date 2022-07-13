import {z, ZodIssueCode} from 'zod'
import {Comparable, ValueObject} from '@/domain/core/ValueObject'
import * as E from 'fp-ts/Either'
import {pipe} from 'fp-ts/function'
import * as O from 'fp-ts/Option'

export enum BloodpressureValueError {
  LowerMustSmallerThanUpper = 'LowerMustSmallerThanUpper',
}

export class BloodpressureValue
  extends ValueObject<{
    lower: number
    upper: number
  }>
  implements Comparable<BloodpressureValue>
{
  protected name = 'BloodpressureValue'
  protected schema = z
    .object({
      lower: z.number().gte(20).lte(300),
      upper: z.number().gte(20).lte(300),
    })
    .refine(data => data.lower < data.upper, {
      message: BloodpressureValueError.LowerMustSmallerThanUpper,
      path: ['lower'],
    })

  constructor(_input: {lower: number; upper: number}) {
    super(_input)
    this.parse()
  }

  get errorsXlt() {
    return pipe(
      this.val,
      E.fold(
        ({errors}) =>
          errors.map(({code, path, message}) => {
            // XLT format: `healthcare.input-field.<upper/lower>-bloodpressure.<issue>`
            const issueCode = {
              [ZodIssueCode.too_small]: 'too-small',
              [ZodIssueCode.too_big]: 'too-big',
            }[code]
            if (issueCode) {
              return `healthcare.input-field.${path}-bloodpressure.${issueCode}`
            }
            if (
              path === 'lower' &&
              message === BloodpressureValueError.LowerMustSmallerThanUpper
            ) {
              return 'healthcare.input-field.lower-bloodpressure.must-smaller-than-upper'
            }
            return 'no-xlt'
          }),
        () => []
      )
    )
  }

  private optionValuePair(compare: BloodpressureValue): O.Option<[number, number]> {
    return O.tryCatch(() => {
      const _this = this.getOrCrash()
      const _that = compare.getOrCrash()
      return [_this.lower, _that.lower] // Only get the lower value to compare
    })
  }

  gt(compare: BloodpressureValue): O.Option<boolean> {
    return pipe(
      this.optionValuePair(compare),
      O.map(([_this, _that]) => _this > _that)
    )
  }
  gte(compare: BloodpressureValue): O.Option<boolean> {
    return pipe(
      this.optionValuePair(compare),
      O.map(([_this, _that]) => _this >= _that)
    )
  }
  lt(compare: BloodpressureValue): O.Option<boolean> {
    return pipe(
      this.optionValuePair(compare),
      O.map(([_this, _that]) => _this < _that)
    )
  }
  lte(compare: BloodpressureValue): O.Option<boolean> {
    return pipe(
      this.optionValuePair(compare),
      O.map(([_this, _that]) => _this <= _that)
    )
  }
}
