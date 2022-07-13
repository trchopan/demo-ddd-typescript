import liff from '@line/liff'
import {_LiffRepo, _LiffRepoFailure} from '@/infrastructure/LiffRepo'
import {_HealthcareRepo} from '@/infrastructure/HealthcareRepo'
import {ILiffRepo} from '@/domain/liff/ILiffRepo'
import {IHealthcareRepo} from '@/domain/healthcare/IHealthcareRepo'

export const LiffRepo: ILiffRepo = new _LiffRepo(liff)
// export const LiffRepo: ILiffRepo = new _LiffRepoFailure(liff)
export const HealthcareRepo: IHealthcareRepo = new _HealthcareRepo(
  window.localStorage
)
