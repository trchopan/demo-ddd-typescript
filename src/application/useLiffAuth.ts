import {defineStore} from 'pinia'
import {UserProfile} from '@/domain/liff/UserProfile'
import {LiffRepo} from '@/application/inject'
import * as T from 'fp-ts/Task'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import {constNull, identity, pipe} from 'fp-ts/function'
import {LiffError} from '@/domain/liff/ILiffRepo'
import {NotInitedError} from '@/domain/core/ValueFailure'

export interface AuthState {
  isLoading: boolean
  eitherUserProfile: E.Either<NotInitedError | LiffError, UserProfile>
}

export const useLiffAuth = defineStore('liffAuth', {
  state: (): AuthState => ({
    isLoading: false,
    eitherUserProfile: E.left(new NotInitedError()),
  }),
  getters: {
    isLoadingOrNotInited(state) {
      return (
        state.isLoading ||
        (E.isLeft(state.eitherUserProfile) &&
          state.eitherUserProfile.left instanceof NotInitedError)
      )
    },
    userProfile(state): UserProfile | null {
      return pipe(
        state.eitherUserProfile as E.Either<Error, UserProfile>,
        E.fold(constNull, identity)
      )
    },
    errorXlt(state) {
      if (
        E.isRight(state.eitherUserProfile) ||
        state.eitherUserProfile.left instanceof NotInitedError
      )
        return ''
      return (state.eitherUserProfile.left as LiffError).errorXlt
    },
  },
  actions: {
    async authCheck() {
      this.isLoading = true
      this.eitherUserProfile = await pipe(
        LiffRepo.initLiff(),
        T.delay(1000), // Simulate loading
        TE.chainW(() => LiffRepo.getUserProfile())
      )()
      this.isLoading = false
    },
    async logout() {
      this.isLoading = true
      this.eitherUserProfile = await pipe(
        TE.fromEither(LiffRepo.logout()),
        T.delay(1000), // Simulate loading
        TE.chainW(() => LiffRepo.initLiff()),
        TE.fold(
          err => T.of(E.left(err)),
          () => T.of(E.left(new NotInitedError()))
        )
      )()
      this.isLoading = false
    },
  },
})
