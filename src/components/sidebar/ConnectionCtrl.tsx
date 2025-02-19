import { disconnectByIdAPI } from '@/api'
import { SORT_DIRECTION, SORT_TYPE } from '@/constant'
import { useTooltip } from '@/helper/tooltip'
import { isMiddleScreen } from '@/helper/utils'
import {
  connectionFilter,
  connectionSortDirection,
  connectionSortType,
  isPaused,
  quickFilterEnabled,
  quickFilterRegex,
  renderConnections,
} from '@/store/connections'
import { useConnectionCard } from '@/store/settings'
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  PauseIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { twMerge } from 'tailwind-merge'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DialogWrapper from '../common/DialogWrapper.vue'
import TextInput from '../common/TextInput.vue'
import ConnectionCardSettings from '../settings/ConnectionCardSettings.vue'
import TableSettings from '../settings/TableSettings.vue'
import ConnectionTabs from './ConnectionTabs.vue'
import SourceIPFilter from './SourceIPFilter.vue'

const handlerClickCloseAll = () => {
  renderConnections.value.forEach((conn) => {
    disconnectByIdAPI(conn.id)
  })
}

export default defineComponent({
  name: 'ConnectionCtrl',
  components: {
    TextInput,
    ConnectionTabs,
    SourceIPFilter,
  },
  props: {
    horizontal: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const settingsModel = ref(false)
    const { showTip } = useTooltip()

    return () => {
      const sortForCards = (
        <div class={['flex w-full items-center gap-1 text-sm', props.horizontal && 'md:w-auto']}>
          <span class="shrink-0">{t('sortBy')}</span>
          <div class="join flex-1 max-md:w-0">
            <select
              class="join-item select select-bordered select-sm flex-1 max-md:w-0"
              v-model={connectionSortType.value}
            >
              {(Object.values(SORT_TYPE) as string[]).map((opt) => (
                <option
                  key={opt}
                  value={opt}
                >
                  {t(opt) || opt}
                </option>
              ))}
            </select>
            <button
              class="btn join-item btn-sm"
              onClick={() => {
                connectionSortDirection.value =
                  connectionSortDirection.value === SORT_DIRECTION.ASC
                    ? SORT_DIRECTION.DESC
                    : SORT_DIRECTION.ASC
              }}
            >
              {connectionSortDirection.value === SORT_DIRECTION.ASC ? (
                <ArrowUpCircleIcon class="h-4 w-4" />
              ) : (
                <ArrowDownCircleIcon class="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )

      const settingsModal = (
        <>
          <button
            class={twMerge('btn btn-circle btn-sm')}
            onClick={() => (settingsModel.value = true)}
          >
            <WrenchScrewdriverIcon class="h-4 w-4" />
          </button>
          <DialogWrapper v-model={settingsModel.value}>
            <div class="flex flex-col gap-4 p-2 text-sm">
              <div class="flex items-center gap-2">
                <span class="shrink-0">{t('hideConnectionRegex')}</span>
                <TextInput
                  class="w-32 max-w-64 flex-1"
                  v-model={quickFilterRegex.value}
                />
              </div>
              <div class="flex items-center gap-2">
                {t('hideConnection')}
                <input
                  type="checkbox"
                  class="toggle"
                  v-model={quickFilterEnabled.value}
                />
                <div
                  onMouseenter={(e) =>
                    showTip(e, t('hideConnectionTip'), {
                      appendTo: 'parent',
                    })
                  }
                >
                  <QuestionMarkCircleIcon class="h-4 w-4" />
                </div>
              </div>
              {useConnectionCard.value ? <ConnectionCardSettings /> : <TableSettings />}
            </div>
          </DialogWrapper>
        </>
      )

      const searchInput = (
        <TextInput
          v-model={connectionFilter.value}
          placeholder={t('search')}
          clearable={true}
          before-close={true}
          class={[props.horizontal ? 'max-md:flex-1 md:w-80' : 'flex-1']}
        />
      )

      const buttons = (
        <>
          <button
            class="btn btn-circle btn-sm"
            onClick={() => {
              isPaused.value = !isPaused.value
            }}
          >
            {isPaused.value ? <PlayIcon class="h-4 w-4" /> : <PauseIcon class="h-4 w-4" />}
          </button>
          <button
            class="btn btn-circle btn-sm"
            onClick={handlerClickCloseAll}
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </>
      )

      if (props.horizontal) {
        if (isMiddleScreen.value) {
          return (
            <div class="flex flex-wrap items-center gap-2 p-2">
              <div class="flex w-full items-center justify-between gap-2">
                <ConnectionTabs />
                {!useConnectionCard.value && (
                  <div class="flex items-center gap-1">
                    {settingsModal}
                    {buttons}
                  </div>
                )}
              </div>
              {useConnectionCard.value && (
                <div class="flex w-full items-center gap-2">
                  {sortForCards}
                  {settingsModal}
                  {buttons}
                </div>
              )}
              <div class="join w-full">
                <SourceIPFilter class="w-40" />
                {searchInput}
              </div>
            </div>
          )
        }
        return (
          <div class="flex flex-wrap items-center gap-2 p-2">
            <ConnectionTabs />
            {useConnectionCard.value && sortForCards}
            <SourceIPFilter class="w-40" />
            {searchInput}
            <div class="flex-1"></div>
            {settingsModal}
            {buttons}
          </div>
        )
      }

      return (
        <div class="flex flex-wrap items-center gap-2 p-2">
          <ConnectionTabs class="w-full" />
          <div class="flex w-full items-center gap-2">
            <SourceIPFilter class="w-40 flex-1" />
            {settingsModal}
            {buttons}
          </div>
          {searchInput}
          {useConnectionCard.value && sortForCards}
        </div>
      )
    }
  },
})
