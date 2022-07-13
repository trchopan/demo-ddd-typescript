<script setup lang="ts">
import Record from '@/presentation/Record/index.vue'
import Loading from '@/presentation/components/Loading.vue'
import {onMounted} from 'vue'
import {LogoutIcon, StatusOfflineIcon} from '@heroicons/vue/outline'
import {useLiffAuth} from './application/useLiffAuth'
import * as E from 'fp-ts/Either'

const liffAuth = useLiffAuth()
onMounted(async () => {
  await liffAuth.authCheck()
})
</script>

<template>
  <Loading v-if="liffAuth.isLoadingOrNotInited" class="h-screen">
    <h1 class="mb-2 font-bold">Checking Authentication</h1>
    <h1 class="mb-2">Please wait</h1>
  </Loading>
  <div v-else-if="E.isLeft(liffAuth.eitherUserProfile)">
    <div class="flex flex-col justify-center items-center h-screen">
      <StatusOfflineIcon class="w-6 h-6" />
      <div>{{ $t(liffAuth.errorXlt) }}</div>
    </div>
  </div>
  <!-- Everything is good -->
  <div v-else class="px-5 py-5">
    <div class="text-center mb-3">
      <div class="mb-5 flex justify-between">
        <div class="flex items-center">
          <img
            :src="liffAuth.userProfile?.pictureUrl.getOrCrash()"
            class="w-10 h-10 rounded-full mr-2"
          />
          <h2 class="text-lg font-bold">
            {{ liffAuth.userProfile?.displayName.getOrCrash() }}
          </h2>
        </div>
        <button @click="liffAuth.logout()" class="btn btn-ghost p-2">
          <LogoutIcon class="w-6 h-6" />
        </button>
      </div>
      <h1 class="text-md font-bold">Healthcare v1.0.1</h1>
      <p>Let's record your health</p>
    </div>
    <Record />
  </div>
</template>

<style scoped></style>
