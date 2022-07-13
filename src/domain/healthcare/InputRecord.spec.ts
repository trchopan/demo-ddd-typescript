import {EntityError, EntityErrorCode} from '../core/Entity'
import {BloodpressureValue} from './BloodpressureValue'
import {InputRecord, InputRecordMapper} from './InputRecord'
import {TimebasedId} from './TimebasedId'
import {WeightValue} from './WeightValue'

describe('domain/healthcare/InputRecord', () => {
  it('InputRecord pass', () => {
    const record = new InputRecord(
      {
        weight: new WeightValue(100),
        bloodpressure: new BloodpressureValue({lower: 80, upper: 120}),
      },
      new TimebasedId(1546300800)
    )
    expect(record.weight.getOrCrash()).toEqual(100)
    expect(record.bloodpressure.getOrCrash()).toEqual({lower: 80, upper: 120})
  })

  it('InputRecord can map to DTO', () => {
    const record = new InputRecord(
      {
        weight: new WeightValue(100),
        bloodpressure: new BloodpressureValue({lower: 80, upper: 120}),
      },
      new TimebasedId(1546300800)
    )
    const expectObj = {
      timebasedId: 1546300800,
      weight: 100,
      bloodpressure: {
        lower: 80,
        upper: 120,
      },
    }
    expect(InputRecordMapper.toDTO(record)).toEqual(expectObj)
  })

  it('InputRecord can map to Domain', () => {
    const inputObj = {
      timebasedId: 1546300800,
      weight: 100,
      bloodpressure: {
        lower: 80,
        upper: 120,
      },
    }
    const inputRecord = InputRecordMapper.toDomain(inputObj)
    expect(inputRecord.timebasedId.getOrCrash()).toEqual(inputObj.timebasedId)
    expect(inputRecord.weight.getOrCrash()).toEqual(inputObj.weight)
    expect(inputRecord.bloodpressure.getOrCrash()).toEqual(
      inputObj.bloodpressure
    )
  })

  it('InputRecord can map to Domain crash if has bad shape', () => {
    const missingTimestampId = {
      weight: 100,
      bloodpressure: {
        lower: 80,
        upper: 120,
      },
    }
    expect(() => InputRecordMapper.toDomain(missingTimestampId)).toThrow(
      new EntityError('InputRecord', EntityErrorCode.Corrupted, 'timebasedId')
    )
  })
})
