import { fetchMemoryAPI, fetchTrafficAPI } from '@/api'
import { ref, watch } from 'vue'
import { activeConnections } from './connections'

export const timeSaved = 60
const initValue = new Array(timeSaved).fill(0).map((v, i) => ({ name: i, value: v }))

export const memory = ref<number>(0)
export const memoryHistory = ref([...initValue])
export const connectionsHistory = ref([...initValue])

export const downloadSpeed = ref<number>(0)
export const uploadSpeed = ref<number>(0)
export const downloadSpeedHistory = ref([...initValue])
export const uploadSpeedHistory = ref([...initValue])

let cancel: () => void

export const initSatistic = () => {
  cancel?.()

  downloadSpeedHistory.value = [...initValue]
  uploadSpeedHistory.value = [...initValue]
  memoryHistory.value = [...initValue]

  const { data: memoryWsData, close: memoryWsClose } = fetchMemoryAPI<{
    inuse: number
  }>()
  const unwatchMemory = watch(
    () => memoryWsData.value,
    (data) => {
      if (!data) return
      const timestamp = Date.now().valueOf()

      memory.value = data.inuse
      memoryHistory.value.push({
        value: data.inuse,
        name: timestamp,
      })
      connectionsHistory.value.push({
        value: activeConnections.value.length,
        name: timestamp,
      })

      memoryHistory.value = memoryHistory.value.slice(-1 * timeSaved)
      connectionsHistory.value = connectionsHistory.value.slice(-1 * timeSaved)
    },
  )

  const { data: trafficWsData, close: trafficWsClose } = fetchTrafficAPI<{
    down: number
    up: number
  }>()
  const unwatchTraffic = watch(
    () => trafficWsData.value,
    (data) => {
      if (!data) return

      const timestamp = Date.now().valueOf()

      downloadSpeed.value = data.down
      uploadSpeed.value = data.up

      downloadSpeedHistory.value.push({
        value: data.down,
        name: timestamp,
      })
      uploadSpeedHistory.value.push({
        value: data.up,
        name: timestamp,
      })

      downloadSpeedHistory.value = downloadSpeedHistory.value.slice(-1 * timeSaved)
      uploadSpeedHistory.value = uploadSpeedHistory.value.slice(-1 * timeSaved)
    },
  )

  cancel = () => {
    memoryWsClose()
    trafficWsClose()
    unwatchMemory()
    unwatchTraffic()
  }
}
