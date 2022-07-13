import {z, ZodIssueCode} from 'zod'
import {ValueObject} from '@/domain/core/ValueObject'
import * as E from 'fp-ts/Either'
import {constNull, pipe} from 'fp-ts/function'

export class WeightValue extends ValueObject<number> {
  protected name = 'WeightValue'
  protected schema = z.number().gte(20).lte(300)

  constructor(_input: number) {
    super(_input)
    this.parse()
  }

  get errorsXlt() {
    return pipe(
      this.val,
      E.fold(
        ({errors}) =>
          errors.map(e => {
            switch (e.code) {
              case ZodIssueCode.too_big:
                return 'healthcare.input-field.weight.too-big'
              case ZodIssueCode.too_small:
                return 'healthcare.input-field.weight.too-small'
              default:
                return 'unknown-error'
            }
          }),
        () => []
      )
    )
  }
}
