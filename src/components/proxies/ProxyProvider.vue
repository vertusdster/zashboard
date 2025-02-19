<template>
  <CollapseCard :name="proxyProvider.name">
    <template v-slot:title>
      <div class="flex items-center gap-2">
        <div class="text-lg font-medium sm:text-xl">
          {{ proxyProvider.name }}
          <span class="text-sm"> ({{ sortedProxies.length }}) </span>
          <span class="ml-1 text-sm text-base-content/60"
            >{{ $t('updated') }} {{ fromNow(proxyProvider.updatedAt) }}</span
          >
        </div>
        <div class="flex-1" />
        <div class="flex gap-2">
          <button
            :class="twMerge('btn btn-circle btn-sm z-30')"
            @click.stop="healthCheckClickHandler"
          >
            <span
              v-if="isHealthChecking"
              class="loading loading-spinner loading-xs"
            ></span>
            <BoltIcon
              v-else
              class="h-4 w-4"
            />
          </button>
          <button
            :class="twMerge('btn btn-circle btn-sm z-30', isUpdating ? 'animate-spin' : '')"
            @click.stop="updateProviderClickHandler"
          >
            <ArrowPathIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
      <progress
        class="progress mt-2 text-slate-500"
        v-if="subscriptionInfo"
        :value="subscriptionInfo.percentage"
        max="100"
      />
      <div
        v-if="subscriptionInfo"
        class="flex justify-between text-sm text-base-content/60"
      >
        <div>
          {{ subscriptionInfo.used }} / {{ subscriptionInfo.total }} (
          {{ subscriptionInfo.percentage }}% )
        </div>
        <div>{{ subscriptionInfo.expirePrefix() }}: {{ subscriptionInfo.expireStr() }}</div>
      </div>
    </template>
    <template v-slot:preview>
      <ProxyPreview :nodes="sortedProxies" />
    </template>
    <template v-slot:content>
      <ProxyNodeGrid>
        <ProxyNodeCard
          v-for="node in sortedProxies"
          :key="node"
          :name="node"
        />
      </ProxyNodeGrid>
    </template>
  </CollapseCard>
</template>

<script setup lang="ts">
import { proxyProviderHealthCheckAPI, updateProxyProviderAPI } from '@/api'
import { fromNow, prettyBytesHelper, sortAndFilterProxyNodes } from '@/helper'
import { fetchProxies, proxyProviederList } from '@/store/proxies'
import type { SubscriptionInfo } from '@/types'
import { ArrowPathIcon, BoltIcon } from '@heroicons/vue/24/outline'
import dayjs from 'dayjs'
import { toFinite } from 'lodash'
import { twMerge } from 'tailwind-merge'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CollapseCard from '../common/CollapseCard.vue'
import ProxyNodeCard from './ProxyNodeCard.vue'
import ProxyNodeGrid from './ProxyNodeGrid.vue'
import ProxyPreview from './ProxyPreview.vue'

const props = defineProps<{
  name: string
}>()

const getSubscriptionsInfo = (subscriptionInfo: SubscriptionInfo) => {
  const { Download = 0, Upload = 0, Total = 0, Expire = 0 } = subscriptionInfo

  if (Download === 0 && Upload === 0 && Total === 0 && Expire === 0) {
    return null
  }

  const total = prettyBytesHelper(Total, { binary: true })
  const used = prettyBytesHelper(Download + Upload, { binary: true })
  const percentage = toFinite((((Download + Upload) / Total) * 100).toFixed(2))

  const expirePrefix = () => {
    const { t } = useI18n()

    return t('expire')
  }

  const expireStr = () => {
    const { t } = useI18n()

    if (Expire === 0) {
      return t('noExpire')
    }

    return dayjs(Expire * 1000).format('YYYY-MM-DD')
  }

  return {
    total,
    used,
    percentage,
    expirePrefix,
    expireStr,
  }
}

const proxyProvider = computed(
  () => proxyProviederList.value.find((group) => group.name === props.name)!,
)
const sortedProxies = computed(() => {
  return sortAndFilterProxyNodes(proxyProvider.value.proxies.map((node) => node.name))
})
const subscriptionInfo = computed(() => {
  if (proxyProvider.value.subscriptionInfo) {
    return getSubscriptionsInfo(proxyProvider.value.subscriptionInfo)
  }

  return null
})

const isUpdating = ref(false)
const isHealthChecking = ref(false)

const healthCheckClickHandler = async () => {
  if (isHealthChecking.value) return

  isHealthChecking.value = true
  try {
    await proxyProviderHealthCheckAPI(props.name)
    await fetchProxies()
    isHealthChecking.value = false
  } catch {
    isHealthChecking.value = false
  }
}

const updateProviderClickHandler = async () => {
  if (isUpdating.value) return

  isUpdating.value = true
  try {
    await updateProxyProviderAPI(props.name)
    await fetchProxies()
    isUpdating.value = false
  } catch {
    isUpdating.value = false
  }
}
</script>
