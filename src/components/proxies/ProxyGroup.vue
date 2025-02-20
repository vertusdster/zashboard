<template>
  <CollapseCard :name="proxyGroup.name">
    <template v-slot:title>
      <div
        class="relative flex items-center gap-2"

      >
        <div class="flex flex-1 items-center gap-1">
          <ProxyName
            :name="proxyGroup.name"
            size="large"
          />
          <span class="text-xs text-base-content/60">
            : {{ proxyGroup.type }} ({{ availableProxies?.length }})
          </span>
          <button
            v-if="manageHiddenGroup"
            class="btn btn-circle btn-xs z-10 ml-1"
            @click.stop="handlerGroupToggle"
          >
            <EyeIcon
              v-if="!hiddenGroupMap[proxyGroup.name]"
              class="h-3 w-3"
            />
            <EyeSlashIcon
              v-else
              class="h-3 w-3"
            />
          </button>
        </div>
        <LatencyTag
          :class="twMerge('z-10 bg-base-200/40 hover:shadow')"
          :loading="isLatencyTesting"
          :name="proxyGroup.now"
          :group-name="proxyGroup.name"
          @click.stop="handlerLatencyTest"
        />
      </div>
      <div
        class="mt-[2px] flex items-center gap-2 text-base-content/80"

      >
        <div class="flex flex-1 items-center gap-1 text-sm">
          <template v-if="proxyGroup.now">
            <ArrowRightCircleIcon class="h-4 w-4 shrink-0" />
            <ProxyName :name="proxyGroup.now" />
          </template>
          <template v-else-if="proxyGroup.type.toLowerCase() === PROXY_TYPE.LoadBalance">
            <CheckCircleIcon class="h-4 w-4 shrink-0" />
            {{ $t('loadBalance') }}
          </template>
        </div>
        <div class="min-w-12 shrink-0 text-right text-xs">
          {{ prettyBytesHelper(downloadTotal) }}/s
        </div>
      </div>
    </template>
    <template v-slot:preview>
      <ProxyPreview
        :nodes="availableProxies"
        :now="proxyGroup.now"
        :groupName="proxyGroup.name"
        @nodeclick="selectProxy(proxyGroup.name, $event)"
      />
    </template>
    <template v-slot:content>
      <div class="max-h-[70vh] min-h-[50vh] overflow-y-auto px-1 pb-1">
        <ProxyNodeGrid class="h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
          <ProxyNodeCard
            v-for="node in availableProxies"
            :key="node"
            :name="node"
            :group-name="proxyGroup.name"
            :active="node === proxyGroup.now"
            @click="selectProxy(proxyGroup.name, node)"
          />
        </ProxyNodeGrid>
      </div>
    </template>
  </CollapseCard>
</template>

<script setup lang="ts">
import { PROXY_TYPE } from '@/constant'
import { prettyBytesHelper, sortAndFilterProxyNodes } from '@/helper'
import { activeConnections } from '@/store/connections'
import { hiddenGroupMap, proxyGroupLatencyTest, proxyMap, selectProxy } from '@/store/proxies'
import { manageHiddenGroup } from '@/store/settings'
import {
  ArrowRightCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/vue/24/outline'
import { twMerge } from 'tailwind-merge'
import { computed, ref } from 'vue'
import CollapseCard from '../common/CollapseCard.vue'
import LatencyTag from './LatencyTag.vue'
import ProxyName from './ProxyName.vue'
import ProxyNodeCard from './ProxyNodeCard.vue'
import ProxyNodeGrid from './ProxyNodeGrid.vue'
import ProxyPreview from './ProxyPreview.vue'

const props = defineProps<{
  name: string
}>()

const proxyGroup = computed(() => proxyMap.value[props.name])

// Check if a proxy is used by other groups
const isProxyUsedByOtherGroups = (proxyName: string) => {
  return Object.entries(proxyMap.value).some(([groupName, group]) => {
    return groupName !== props.name && 
           group.now === proxyName && 
           group.type.toLowerCase() !== PROXY_TYPE.LoadBalance
  })
}

// Filter out proxies that are used by other groups
const availableProxies = computed(() => {
  const allProxies = sortAndFilterProxyNodes(proxyGroup.value.all ?? [], props.name)
  return allProxies.filter(proxy => !isProxyUsedByOtherGroups(proxy))
})

const isLatencyTesting = ref(false)
const handlerLatencyTest = async () => {
  if (isLatencyTesting.value) return

  isLatencyTesting.value = true
  try {
    await proxyGroupLatencyTest(props.name)
    isLatencyTesting.value = false
  } catch {
    isLatencyTesting.value = false
  }
}

const downloadTotal = computed(() => {
  const speed = activeConnections.value
    .filter((conn) => conn.chains.includes(props.name))
    .reduce((total, conn) => total + conn.downloadSpeed, 0)

  return speed
})

const handlerGroupToggle = () => {
  hiddenGroupMap.value[props.name] = !hiddenGroupMap.value[props.name]
}
</script>