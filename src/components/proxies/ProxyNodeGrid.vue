<template>
  <div
    class="grid max-h-96 gap-2 overflow-y-auto overflow-x-hidden"
    :style="`grid-template-columns: repeat(auto-fill, minmax(${proxyCardSize === PROXY_CARD_SIZE.LARGE ? 145 : 130}px, 1fr));`"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { PROXY_CARD_SIZE } from '@/constant'
import { proxyCardSize } from '@/store/settings'
</script>
