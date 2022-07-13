import {defineStore} from 'pinia'
import {InputRecord} from '@/domain/healthcare/InputRecord'
import {
  InputRecordList,
  InputRecordListLimitError,
} from '@/domain/healthcare/InputRecordList'
import {UserProfile} from '@/domain/liff/UserProfile'
import {constNull, identity, pipe} from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import {HealthcareRepo} from './inject'
import {
  HealthcareError,
  HealthcareErrorCode,
} from '@/domain/healthcare/IHealthcareRepo'
import {NotInitedError} from '@/domain/core/ValueFailure'
import {last} from 'lodash'

interface RecordMeState {
  isLoading: boolean
  inputRecord: InputRecord | null
  eitherRecordList: E.Either<
    NotInitedError | HealthcareError | InputRecordListLimitError,
    InputRecordList
  >
}

export const useRecordMe = defineStore('recordMe', {
  state: (): RecordMeState => ({
    isLoading: false,
    inputRecord: null,
    eitherRecordList: E.left(new NotInitedError()),
  }),
  getters: {
    recordList(state): InputRecordList | null {
      return pipe(
        state.eitherRecordList as E.Either<Error, InputRecordList>,
        E.fold(constNull, identity)
      )
    },
    isNotInited(state) {
      return (
        E.isLeft(state.eitherRecordList) &&
        state.eitherRecordList.left instanceof NotInitedError
      )
    },
    isNotFoundRecordList(state) {
      return (
        E.isLeft(state.eitherRecordList) &&
        state.eitherRecordList.left instanceof HealthcareError &&
        state.eitherRecordList.left.code === HealthcareErrorCode.NotfoundError
      )
    },
    isFullList(state) {
      return (
        E.isLeft(state.eitherRecordList) &&
        state.eitherRecordList.left instanceof InputRecordListLimitError
      )
    },
  },
  actions: {
    async loadRecordForUser(userProfile: UserProfile) {
      this.isLoading = true
      this.eitherRecordList = await pipe(
        TE.fromEither(HealthcareRepo.loadLocalstorage(userProfile.userId)),
        T.delay(1000) // Simulate loading
      )()
      this.isLoading = false
    },
    async createRecordList(userProfile: UserProfile) {
      this.isLoading = true
      this.eitherRecordList = await pipe(
        T.of(InputRecordList.emptyRecord(userProfile.userId)),
        T.delay(1000), // Simulate loading
        TE.fromTask,
        TE.chain(recordList =>
          pipe(
            HealthcareRepo.saveLocalstorage(userProfile.userId, recordList),
            E.map(() => recordList),
            TE.fromEither
          )
        )
      )()
      this.isLoading = false
    },
    mkInputRecord() {
      this.inputRecord = pipe(
        this.eitherRecordList,
        E.fold(
          () => InputRecord.defaultRecord(),
          recordList => {
            const lastRecord = last(recordList.data)
            return lastRecord
              ? InputRecord.fromLastRecord(lastRecord as InputRecord)
              : InputRecord.defaultRecord()
          }
        )
      )
    },
    async addInputRecord(userProfile: UserProfile) {
      this.isLoading = true
      this.eitherRecordList = await pipe(
        O.fromNullable(this.inputRecord),
        TE.fromOption(() => new NotInitedError()),
        T.delay(1000), // Simulate loading
        TE.chainW(inputRecord =>
          pipe(
            this.eitherRecordList,
            E.map(recordList =>
              InputRecordList.addAndRotate(
                recordList as InputRecordList,
                inputRecord as InputRecord
              )
            ),
            E.chainW(recordList =>
              pipe(
                HealthcareRepo.saveLocalstorage(userProfile.userId, recordList),
                E.map(() => recordList)
              )
            ),
            T.of
          )
        )
      )()

      this.isLoading = false
    },
    async clearRecordListOfUser(userProfile: UserProfile) {
      this.isLoading = true
      this.eitherRecordList = await pipe(
        TE.fromEither(HealthcareRepo.clearLocalstorage(userProfile.userId)),
        T.delay(1000), // Simulate loading
        TE.fold(
          err => TE.left(err),
          () => TE.left(new HealthcareError(HealthcareErrorCode.NotfoundError))
        )
      )()
      this.isLoading = false
    },
  },
})
