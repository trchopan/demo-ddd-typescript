<script setup lang="ts">
import * as E from 'fp-ts/Either'
import EmptyInputImg from '@/assets/empty-input.png'
import {useRecordMe} from '@/application/useRecordMe'
import {useLiffAuth} from '@/application/useLiffAuth'
import Loading from '@/presentation/components/Loading.vue'

const recordMe = useRecordMe()
const liffAuth = useLiffAuth()

const onClearList = async () => {
  if (!liffAuth.userProfile) throw new Error('must have userProfile')
  await recordMe.clearRecordListOfUser(liffAuth.userProfile)
}

const onCreateList = async () => {
  if (!liffAuth.userProfile) throw new Error('must have userProfile')
  await recordMe.createRecordList(liffAuth.userProfile)
}
</script>

<template>
  <div v-if="recordMe.isNotInited">
    <Loading><p>Loading Records</p></Loading>
  </div>
  <div v-else-if="recordMe.isNotFoundRecordList" class="text-center my-5">
    <div class="max-w-sm mx-auto px-10 mt-10 mb-5">
      <img :src="EmptyInputImg" class="w-1/2 mx-auto" />
    </div>
    <div class="text-center">
      <button
        @click="onCreateList"
        class="btn btn-primary my-3"
        :class="{loading: recordMe.isLoading}"
        :disabled="recordMe.isLoading"
      >
        Create List
      </button>
      <p>
        By creating this record you agree to <br />
        <b>Terms and Conditions</b>
      </p>
    </div>
  </div>
  <div v-else-if="E.isLeft(recordMe.eitherRecordList)">
    <div class="max-w-sm mx-auto px-10 mt-10 mb-5">
      <img :src="EmptyInputImg" class="w-1/2 mx-auto" />
    </div>
    <div class="text-center">
      <p v-if="recordMe.isFullList">This is the case for Full List</p>
      <pre v-else>{{ recordMe.eitherRecordList }}</pre>
    </div>
  </div>
  <div v-else class="my-10">
    <table class="mx-auto my-5 text-center">
      <tr>
        <th class="px-2 w-4/12">Time</th>
        <th class="px-2 w-2/12">Weight</th>
        <th class="px-2 w-2/12">Sys.</th>
        <th class="px-2 w-2/12">Dias.</th>
      </tr>
      <tr
        v-for="(record, index) of recordMe.recordList?.data"
        :key="`record-${index}`"
      >
        <td class="px-2">
          {{ $dateFns.defaultFormat(record.timebasedId.toDate()) }}
        </td>
        <td class="px-2">{{ record.weight.getOrCrash() }}</td>
        <td class="px-2">{{ record.bloodpressure.getOrCrash().upper }}</td>
        <td class="px-2">{{ record.bloodpressure.getOrCrash().lower }}</td>
      </tr>
    </table>
    <div class="flex flex-col items-center gap-3">
      <button
        @click="$router.push('/record/input')"
        class="btn btn-primary"
        :disabled="recordMe.isLoading"
      >
        Add Record
      </button>
      <button
        @click="onClearList"
        class="btn btn-secondary"
        :class="{loading: recordMe.isLoading}"
        :disabled="recordMe.isLoading"
      >
        Clear List
      </button>
    </div>
  </div>
</template>
