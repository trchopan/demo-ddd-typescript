import {z} from 'zod'
import {ValueObject} from '@/domain/core/ValueObject'

export enum TimebasedIdValueError {
  BeforeSupportedTimestamp = 'BeforeSupportedTimestamp',
}

export class TimebasedId extends ValueObject<number> {
  protected name = 'TimebasedId'
  protected schema = z
    .number()
    .refine(v => v >= TimebasedId.EARLIEST_SUPPORT_TIMESTAMP_SECONDS(), {
      message: TimebasedIdValueError.BeforeSupportedTimestamp,
    })

  constructor(_input: number) {
    super(_input)
    this.parse()
  }

  toDate() {
    return new Date(this.getOrCrash() * 1000)
  }

  static EARLIEST_SUPPORT_TIMESTAMP_SECONDS() {
    return 1546300800 // 2019-01-01
  }

  static now() {
    return TimebasedId.fromDate(new Date())
  }

  static fromDate(d: Date) {
    return new TimebasedId(Math.floor(d.getTime() / 1000))
  }
}
