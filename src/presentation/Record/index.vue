<script setup lang="ts">
import {onMounted} from 'vue'
import {useRecordMe} from '@/application/useRecordMe'
import {useLiffAuth} from '@/application/useLiffAuth'

const liffAuth = useLiffAuth()
const recordMe = useRecordMe()

onMounted(async () => {
  if (!liffAuth.userProfile) throw new Error('must have userProfile')
  await recordMe.loadRecordForUser(liffAuth.userProfile)
})
</script>

<template>
  <router-view />
</template>
