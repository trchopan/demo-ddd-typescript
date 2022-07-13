import {
  corrupted,
  Entity,
  EntityError,
  missingField,
} from '@/domain/core/Entity'
import {random} from 'lodash'
import {TimebasedId} from './TimebasedId'
import {WeightValue} from './WeightValue'
import {BloodpressureValue} from './BloodpressureValue'
import * as E from 'fp-ts/lib/Either'

interface InputRecordProps {
  weight: WeightValue
  bloodpressure: BloodpressureValue
}

export class InputRecord extends Entity<InputRecordProps, TimebasedId> {
  constructor(props: InputRecordProps, _id: TimebasedId) {
    super(props, _id)
  }

  get timebasedId() {
    return this._id
  }

  get weight() {
    return this.props.weight
  }

  get bloodpressure() {
    return this.props.bloodpressure
  }

  get isValid() {
    return this.weight.isRight && this.bloodpressure.isRight
  }

  static defaultRecord() {
    return new InputRecord(
      {
        weight: new WeightValue(random(45, 85)),
        bloodpressure: new BloodpressureValue({
          lower: 80,
          upper: 120,
        }),
      },
      TimebasedId.now()
    )
  }

  static fromLastRecord(lastRecord: InputRecord) {
    return new InputRecord(
      {
        weight: lastRecord.weight,
        bloodpressure: lastRecord.bloodpressure,
      },
      TimebasedId.now()
    )
  }
}

export class InputRecordMapper {
  static toDTO({timebasedId, weight, bloodpressure}: InputRecord): object {
    return {
      timebasedId: timebasedId.getOrCrash(),
      weight: weight.getOrCrash(),
      bloodpressure: bloodpressure.getOrCrash(),
    }
  }

  static toDomain({timebasedId, weight, bloodpressure}: any): InputRecord {
    return new InputRecord(
      {
        weight: new WeightValue(weight),
        bloodpressure: new BloodpressureValue({
          lower: bloodpressure?.lower,
          upper: bloodpressure?.upper,
        }),
      },
      new TimebasedId(timebasedId)
    )
  }

  // TODO static toPersist(sp: InputRecord) {}
}
