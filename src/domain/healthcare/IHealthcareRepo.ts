import * as E from 'fp-ts/lib/Either'
import {UserId} from '@/domain/liff/UserId'
import {InputRecordList} from './InputRecordList'

export enum HealthcareErrorCode {
  ServerError = 'ServerError',
  NetworkError = 'NetworkError',
  LocalstorageError = 'LocalstorageError',
  CorruptedDataError = 'CorruptedDataError',
  NotfoundError = 'NotfoundError',
  UnknownError = 'UnknownError',
}

export class HealthcareError extends Error {
  constructor(public code: HealthcareErrorCode, public error?: any) {
    super(`HealthcareError/${code}`)
  }

  // TODO get errorXlt() {}
}

export interface IHealthcareRepo {
  loadLocalstorage(
    userId: UserId
  ): E.Either<HealthcareError, InputRecordList>

  saveLocalstorage(
    userId: UserId,
    inputRecordList: InputRecordList
  ): E.Either<HealthcareError, void>

  clearLocalstorage(userId: UserId): E.Either<HealthcareError, void>
}
