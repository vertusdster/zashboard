<template>
  <div>{{ $t('customTableColumns') }}</div>
  <div class="flex gap-4 rounded">
    <Draggable
      class="flex flex-1 flex-col gap-2 bg-base-200 p-4"
      v-model="connectionTableColumns"
      group="list"
      :animation="150"
      :item-key="(id: string) => id"
    >
      <template #item="{ element }">
        <div
          class="flex h-8 cursor-move select-none items-center justify-center rounded bg-neutral px-2 text-neutral-content"
        >
          {{ $t(element) }}
        </div>
      </template>
    </Draggable>
    <Draggable
      class="flex flex-1 flex-col gap-2 p-4"
      v-model="restOfColumns"
      group="list"
      :animation="150"
      :item-key="(id: string) => id"
    >
      <template #item="{ element }">
        <div
          class="flex h-8 cursor-move select-none items-center justify-center rounded bg-base-200 px-2 text-base-content"
        >
          {{ $t(element) }}
        </div>
      </template>
    </Draggable>
  </div>
</template>

<script setup lang="ts">
import { CONNECTIONS_TABLE_ACCESSOR_KEY } from '@/constant'
import { connectionTableColumns } from '@/store/settings'
import { ref } from 'vue'
import Draggable from 'vuedraggable'

const restOfColumns = ref(
  Object.values(CONNECTIONS_TABLE_ACCESSOR_KEY).filter(
    (key) => !connectionTableColumns.value.includes(key),
  ),
)
</script>
