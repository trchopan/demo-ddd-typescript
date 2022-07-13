import * as E from 'fp-ts/Either'
import {flow, pipe} from 'fp-ts/function'
import {
  IHealthcareRepo,
  HealthcareErrorCode,
  HealthcareError,
} from '@/domain/healthcare/IHealthcareRepo'
import {
  InputRecordList,
  InputRecordListMapper,
} from '@/domain/healthcare/InputRecordList'
import {UserId} from '@/domain/liff/UserId'

export class _HealthcareRepo implements IHealthcareRepo {
  constructor(private localStorage: Storage) {}

  loadLocalstorage(userId: UserId): E.Either<HealthcareError, InputRecordList> {
    return pipe(
      E.tryCatch(
        () => this.localStorage.getItem(userId.getOrCrash()),
        err => {
          console.error(err)
          return new HealthcareError(HealthcareErrorCode.LocalstorageError, err)
        }
      ),
      E.chainW(
        flow(
          E.fromNullable(
            new HealthcareError(HealthcareErrorCode.NotfoundError)
          ),
          E.map(inputListJson =>
            InputRecordListMapper.toDomain(JSON.parse(inputListJson))
          )
        )
      )
    )
  }

  saveLocalstorage(
    userId: UserId,
    inputRecordList: InputRecordList
  ): E.Either<HealthcareError, void> {
    return pipe(
      E.tryCatch(
        () =>
          this.localStorage.setItem(
            userId.getOrCrash(),
            JSON.stringify(InputRecordListMapper.toDTO(inputRecordList))
          ),
        err => new HealthcareError(HealthcareErrorCode.LocalstorageError, err)
      )
    )
  }

  clearLocalstorage(userId: UserId): E.Either<HealthcareError, void> {
    return pipe(
      E.tryCatch(
        () => this.localStorage.removeItem(userId.getOrCrash()),
        err => new HealthcareError(HealthcareErrorCode.LocalstorageError, err)
      )
    )
  }
}
