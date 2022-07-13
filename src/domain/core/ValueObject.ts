import {ZodAny, ZodEffects, ZodSchema} from 'zod'
import {pipe, identity} from 'fp-ts/function'
import {Either, fold, isLeft, isRight, right, left} from 'fp-ts/Either'
import {Option} from 'fp-ts/Option'
import {isNull, isUndefined, isEqual, cloneDeep} from 'lodash'
import {ValueFailure, NotParsedError} from './ValueFailure'

export abstract class ValueObject<T> {
  protected abstract readonly name: string
  protected abstract readonly schema: ZodSchema<T> | ZodEffects<ZodAny, T, any>
  private _value?: Either<ValueFailure, T>

  constructor(private _input: T) {}

  protected parse() {
    const _parsed = this.schema.safeParse(this._input)
    this._value = _parsed.success
      ? right(_parsed.data)
      : left(
          new ValueFailure(
            this._input,
            _parsed.error.issues.map(e => {
              return {
                path: e.path.join('-'),
                code: e.code,
                message: e.message,
              }
            })
          )
        )
    return this
  }

  get val() {
    if (!this._value) {
      throw new NotParsedError()
    }
    return this._value
  }

  get isLeft() {
    return isLeft(this.val)
  }

  get isRight() {
    return isRight(this.val)
  }

  get input() {
    return this._input
  }

  getOrCrash() {
    return pipe(
      this.val,
      fold(v => {
        throw v
      }, identity)
    )
  }

  fold<Result>(
    onLeft: (err: ValueFailure) => Result,
    onRight: (v: T) => Result
  ) {
    return pipe(this.val, fold(onLeft, onRight))
  }

  equals(vo?: ValueObject<T>): boolean {
    return (
      !isUndefined(vo) &&
      !isNull(vo) &&
      this.isRight &&
      vo.isRight &&
      isEqual(this.getOrCrash(), vo.getOrCrash())
    )
  }

  clone() {
    return cloneDeep(this)
  }

  toString(): string {
    return `${this.name}(${JSON.stringify(this._value, null, 2)})`
  }
}

export const objectToMap = (obj: unknown): Map<string, any> => {
  if (typeof obj !== 'object') throw new Error('must be object')
  const _obj = obj as {[key: string]: any}
  const keys = Object.keys(_obj)
  const map = new Map()
  for (const k of keys) {
    map.set(k, _obj[k])
  }
  return map
}

export abstract class Comparable<T> {
  abstract gt(a: T): Option<boolean>
  abstract gte(a: T): Option<boolean>
  abstract lt(a: T): Option<boolean>
  abstract lte(a: T): Option<boolean>
}
