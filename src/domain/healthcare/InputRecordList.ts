import {cloneDeep} from 'lodash'
import {InputRecord, InputRecordMapper} from './InputRecord'
import {Entity, EntityError, EntityErrorCode} from '../core/Entity'
import {UserId} from '@/domain/liff/UserId'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import {pipe} from 'fp-ts/lib/function'

export class InputRecordListLimitError extends Error {
  constructor(userId: string) {
    super(`InputRecordListLimitError/userId[${userId}]`)
  }
}

interface InputRecordListProps {
  data: InputRecord[]
}

export class InputRecordList extends Entity<InputRecordListProps, UserId> {
  constructor(props: InputRecordListProps, _id: UserId) {
    super(props, _id)
  }

  get userId() {
    return this._id
  }

  get data() {
    return this.props.data
  }

  static LENGTH_LIMIT() {
    return 3
  }

  get isAtLimit() {
    return this.data.length >= InputRecordList.LENGTH_LIMIT()
  }

  get isValid() {
    return this.data.length < InputRecordList.LENGTH_LIMIT()
  }

  static add(
    recordList: InputRecordList,
    inputRecord: InputRecord
  ): E.Either<InputRecordListLimitError, InputRecordList> {
    return recordList.isAtLimit
      ? E.left(new InputRecordListLimitError(recordList.userId.getOrCrash()))
      : E.right(
          new InputRecordList(
            {data: cloneDeep(recordList.data.concat(inputRecord))},
            recordList.userId
          )
        )
  }

  static addAndRotate(
    recordList: InputRecordList,
    inputRecord: InputRecord
  ): InputRecordList {
    return pipe(
      InputRecordList.add(recordList, inputRecord),
      E.getOrElse(() => {
        // conduct new list and shift the first record
        const newList = recordList.data.concat(inputRecord).slice(1)
        return new InputRecordList(
          {data: cloneDeep(newList)},
          recordList.userId
        )
      })
    )
  }

  static emptyRecord(userId: UserId) {
    return new InputRecordList({data: []}, userId)
  }
}

export class InputRecordListMapper {
  static toDTO({userId, data}: InputRecordList): object {
    return {
      userId: userId.getOrCrash(),
      data: data.map(d => InputRecordMapper.toDTO(d)),
    }
  }

  static toDomain({userId, data}: any): InputRecordList {
    return new InputRecordList(
      {data: (data || []).map(InputRecordMapper.toDomain)},
      new UserId(userId)
    )
    // return pipe(
    //   data as any[],
    //   A.traverse(E.Applicative)(InputRecordMapper.toDomain),
    //   E.map(inputRecords => {
    //     return new InputRecordList({data: inputRecords}, new UserId(userId))
    //   })
    // )
  }

  // TODO static toPersist(sp: InputRecordList) {}
}
