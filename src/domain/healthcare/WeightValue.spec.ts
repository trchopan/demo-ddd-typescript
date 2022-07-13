import {ZodIssueCode} from 'zod'
import {ValueFailure} from '../core/ValueFailure'
import {WeightValue} from './WeightValue'

describe('domain/healthcare/WeightValue', () => {
  it('WeightValue throw invalid value', () => {
    const tooBig = new WeightValue(301)
    expect(() => tooBig.getOrCrash()).toThrowError(
      new ValueFailure(tooBig, [
        {path: 'weight', code: ZodIssueCode.too_big, message: ''},
      ])
    )
    const tooSmall = new WeightValue(19)
    expect(() => tooSmall.getOrCrash()).toThrowError(
      new ValueFailure(tooSmall, [
        {path: 'weight', code: ZodIssueCode.too_small, message: ''},
      ])
    )
  })
})
