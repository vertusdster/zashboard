import type { Backend } from '@/types'
import { useStorage } from '@vueuse/core'
import { isEqual, omit } from 'lodash'
import { v4 as uuid } from 'uuid'
import { computed } from 'vue'

export const backendList = useStorage<Backend[]>('setup/api-list', [])
export const activeUuid = useStorage<string>('setup/active-uuid', '')
export const activeBackend = computed(() =>
  backendList.value.find((backend) => backend.uuid === activeUuid.value),
)

export const addBackend = (backend: Omit<Backend, 'uuid'>) => {
  const currentEnd = backendList.value.find((end) => {
    return isEqual(omit(end, 'uuid'), backend)
  })

  if (currentEnd) {
    activeUuid.value = currentEnd.uuid
    return
  }

  const id = uuid()

  backendList.value.push({
    ...backend,
    uuid: id,
  })
  activeUuid.value = id
}

export const removeBackend = (uuid: string) => {
  backendList.value = backendList.value.filter((end) => end.uuid !== uuid)
}
