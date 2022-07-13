import {UserProfile, UserProfileMapper} from '@/domain/liff/UserProfile'
import {ILiffRepo, LiffError, LiffErrorCode} from '@/domain/liff/ILiffRepo'
import {Liff} from '@liff/liff-types'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import {flow, pipe} from 'fp-ts/function'

export class _LiffRepo implements ILiffRepo {
  constructor(private liff: Liff) {}

  initLiff(): TE.TaskEither<LiffError, void> {
    const liffInitPromise = new Promise<void>((resolve, reject) =>
      this.liff.init(
        {
          liffId: '1655312869-K7qmANrm',
          withLoginOnExternalBrowser: true,
        },
        () => resolve(),
        err => reject(err)
      )
    )
    return TE.tryCatch(
      () => liffInitPromise,
      err => {
        console.error(err)
        switch (err as string) {
          case 'network-error':
            return new LiffError(LiffErrorCode.NetworkError, err)
          default:
            return new LiffError(LiffErrorCode.InitializeSDKError, err)
        }
      }
    )
  }

  getUserProfile(): TE.TaskEither<LiffError, UserProfile> {
    return pipe(
      TE.tryCatch(
        () => this.liff.getProfile(),
        err => {
          console.error(err)
          switch (err as string) {
            case 'profile-not-exist':
              return new LiffError(LiffErrorCode.ProfileNotExist, err)
            default:
              return new LiffError(LiffErrorCode.ServerError, err)
          }
        }
      ),
      TE.map(UserProfileMapper.toDomain)
    )
  }

  logout(): E.Either<LiffError, void> {
    return E.tryCatch(
      () => this.liff.logout(),
      err => {
        console.error(err)
        return new LiffError(LiffErrorCode.UnexpectedLoggoutError, err)
      }
    )
  }
}

export class _LiffRepoFailure implements ILiffRepo {
  constructor(private liff: Liff) {}

  initLiff(): TE.TaskEither<LiffError, void> {
    return TE.tryCatch(
      () => Promise.reject('network-error'),
      err => {
        console.error(err)
        switch (err as string) {
          case 'network-error':
            return new LiffError(LiffErrorCode.NetworkError, err)
          default:
            return new LiffError(LiffErrorCode.InitializeSDKError, err)
        }
      }
    )
  }

  getUserProfile(): TE.TaskEither<LiffError, UserProfile> {
    return pipe(
      TE.tryCatch(
        () => Promise.reject('profile-not-exist'),
        err => {
          console.error(err)
          switch (err as string) {
            case 'profile-not-exist':
              return new LiffError(LiffErrorCode.ProfileNotExist, err)
            default:
              return new LiffError(LiffErrorCode.ServerError, err)
          }
        }
      ),
      TE.map(UserProfileMapper.toDomain)
    )
  }

  logout(): E.Either<LiffError, void> {
    return E.tryCatch(
      () => this.liff.logout(),
      err => {
        console.error(err)
        return new LiffError(LiffErrorCode.UnexpectedLoggoutError, err)
      }
    )
  }
}
