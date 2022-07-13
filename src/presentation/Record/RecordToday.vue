<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import NumpadInput from '@/presentation/Record/NumpadInput.vue'
import TimeInput from '@/presentation/Record/TimeInput.vue'
import {useRecordMe} from '@/application/useRecordMe'
import {useLiffAuth} from '@/application/useLiffAuth'
import {WeightValue} from '@/domain/healthcare/WeightValue'
import {BloodpressureValue} from '@/domain/healthcare/BloodpressureValue'
import {InputRecord} from '@/domain/healthcare/InputRecord'
import {TimebasedId} from '@/domain/healthcare/TimebasedId'
import {useRouter} from 'vue-router'
import {isRight} from 'fp-ts/lib/Either'

const router = useRouter()
const liffAuth = useLiffAuth()
const recordMe = useRecordMe()

const localTimebasedId = ref<Date>(TimebasedId.now().toDate())
const timebasedIdVO = computed(() =>
  TimebasedId.fromDate(localTimebasedId.value)
)
const localWeight = ref<number>(0)
const weightVO = computed(() => new WeightValue(localWeight.value))
const localBloodpressure = ref<{lower: number; upper: number}>({
  upper: 0,
  lower: 0,
})
const bloodpressureVO = computed(
  () => new BloodpressureValue(localBloodpressure.value)
)
watch(
  [weightVO, bloodpressureVO, timebasedIdVO],
  ([weight, bloodpressure, timebasedId]) => {
    recordMe.inputRecord = new InputRecord({weight, bloodpressure}, timebasedId)
  },
  {deep: true}
)

const setLocalValues = () => {
  if (!recordMe.inputRecord) return
  const {timebasedId, weight, bloodpressure} = recordMe.inputRecord
  localTimebasedId.value = timebasedId.toDate()
  localWeight.value = weight.getOrCrash()
  localBloodpressure.value = bloodpressure.getOrCrash()
}

const onAddRecord = async () => {
  if (!recordMe.inputRecord?.isValid || !liffAuth.userProfile) return
  await recordMe.addInputRecord(liffAuth.userProfile)
  if (isRight(recordMe.eitherRecordList)) {
    router.push('/record/list')
  }
}

const gotoRecordList = () => {
  router.push('/record/list')
}

onMounted(async () => {
  recordMe.mkInputRecord()
  await nextTick()
  setLocalValues()
})
</script>

<template>
  <div v-if="recordMe.inputRecord" class="text-center my-10">
    <h1 class="text-lg font-bold">Record Me</h1>

    <TimeInput v-model="localTimebasedId" title="Time" class="my-3" />

    <NumpadInput
      v-model="localWeight"
      title="Weight"
      :errors="weightVO.errorsXlt"
    />
    <NumpadInput v-model="localBloodpressure.upper" title="Systolic" />
    <NumpadInput
      v-model="localBloodpressure.lower"
      title="Diastolic"
      :errors="bloodpressureVO.errorsXlt"
    />
  </div>

  <div class="flex flex-col items-center gap-3">
    <button
      @click="onAddRecord"
      class="btn btn-primary"
      :class="{loading: recordMe.isLoading}"
      :disabled="recordMe.isLoading || !recordMe.inputRecord?.isValid"
    >
      Add
    </button>
    <button
      @click="gotoRecordList"
      class="btn"
      :disabled="recordMe.isLoading || !recordMe.inputRecord?.isValid"
    >
      Back
    </button>
  </div>
</template>

<style scoped>
.input-field {
  @apply inline-flex px-2 py-2 my-1;
}
@keyframes cursor-blink {
  0% {
    opacity: 0;
  }
}
.cursor {
  @apply border rounded-sm;
}
.cursor::after {
  content: '';
  display: inline-block;
  height: 1.2rem;
  width: 2px;
  background: blue;
  margin-top: 2px;
  margin-left: 2px;
  animation: cursor-blink 1.5s steps(2) infinite;
}
.verbose {
  @apply text-left px-5 my-10 overflow-x-scroll;
}
</style>
