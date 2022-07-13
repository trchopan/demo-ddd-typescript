import {UserProfile} from './UserProfile'
import {TaskEither} from 'fp-ts/TaskEither'
import {Either} from 'fp-ts/Either'

export enum LiffErrorCode {
  ServerError = 'ServerError',
  NetworkError = 'NetworkError',
  InitializeSDKError = 'InitializeSDKError',
  ProfileNotExist = 'ProfileNotExist',
  UnexpectedLoggoutError = 'UnexpectedLoggoutError',
}

export class LiffError extends Error {
  constructor(public code: LiffErrorCode, public error?: any) {
    super(code)
  }

  get errorXlt() {
    switch (this.code) {
      case LiffErrorCode.NetworkError:
        return 'liff.network-error'
      default:
        return 'liff.unknown-error'
    }
  }
}

export interface ILiffRepo {
  initLiff(): TaskEither<LiffError, void>
  getUserProfile(): TaskEither<LiffError, UserProfile>
  logout(): Either<LiffError, void>
}
