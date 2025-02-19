import { updateProxyProviderAPI } from '@/api'
import { collapsedBus } from '@/composables/bus'
import { proxiesFilter, useProxies } from '@/composables/proxies'
import { PROXY_SORT_TYPE, PROXY_TAB_TYPE } from '@/constant'
import { isMiddleScreen } from '@/helper/utils'
import { configs, updateConfigs } from '@/store/config'
import { allProxiesLatencyTest, fetchProxies, proxyProviederList } from '@/store/proxies'
import {
  automaticDisconnection,
  collapseGroupMap,
  hideUnavailableProxies,
  manageHiddenGroup,
  proxySortType,
} from '@/store/settings'
import {
  BoltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'
import { twMerge } from 'tailwind-merge'
import { computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DialogWrapper from '../common/DialogWrapper.vue'
import TextInput from '../common/TextInput.vue'

export default defineComponent({
  name: 'ProxiesCtrl',
  props: {
    horizontal: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const { proxiesTabShow } = useProxies()
    const isUpgrading = ref(false)
    const isAllLatencyTesting = ref(false)
    const settingsModel = ref(false)
    const handlerClickUpdateAllProviders = async () => {
      if (isUpgrading.value) return
      isUpgrading.value = true
      try {
        await Promise.all(
          proxyProviederList.value.map((provider) => updateProxyProviderAPI(provider.name)),
        )
        await fetchProxies()
        isUpgrading.value = false
      } catch {
        await fetchProxies()
        isUpgrading.value = false
      }
    }

    const hasProviders = computed(() => {
      return proxyProviederList.value.length > 0
    })

    const modeList = computed(() => {
      return (
        configs.value?.['mode-list'] || configs.value?.['modes'] || ['direct', 'rule', 'global']
      )
    })

    const handlerModeChange = (e: Event) => {
      const mode = (e.target as HTMLSelectElement).value
      updateConfigs({ mode })
    }

    const handlerClickLatencyTestAll = async () => {
      if (isAllLatencyTesting.value) return
      isAllLatencyTesting.value = true
      try {
        await allProxiesLatencyTest()
        isAllLatencyTesting.value = false
      } catch {
        isAllLatencyTesting.value = false
      }
    }

    const { renderGroups } = useProxies()
    const hasNotCollapsed = computed(() => {
      return renderGroups.value.some((name) => collapseGroupMap.value[name])
    })

    const handlerClickToggleCollapse = () => {
      collapsedBus.emit({
        open: !hasNotCollapsed.value,
      })
    }

    return () => {
      const tabs = (
        <div
          role="tablist"
          class="tabs-boxed tabs tabs-sm"
        >
          {Object.values(PROXY_TAB_TYPE).map((type) => {
            return (
              <a
                role="tab"
                key={type}
                class={['tab', proxiesTabShow.value === type && 'tab-active']}
                onClick={() => (proxiesTabShow.value = type)}
              >
                {t(type)}
              </a>
            )
          })}
        </div>
      )
      const upgradeAll = proxiesTabShow.value === PROXY_TAB_TYPE.PROVIDER && (
        <button
          class={twMerge('btn btn-sm')}
          onClick={handlerClickUpdateAllProviders}
        >
          {isUpgrading.value ? (
            <span class="loading loading-dots loading-md"></span>
          ) : (
            t('updateAllProviders')
          )}
        </button>
      )
      const modeSelect = configs.value && (
        <select
          class={[
            'select select-bordered select-sm min-w-24',
            props.horizontal ? 'inline-block max-md:flex-1 md:min-w-40' : 'w-0 flex-1',
          ]}
          v-model={configs.value.mode}
          onChange={handlerModeChange}
        >
          {modeList.value.map((mode) => {
            return (
              <option
                key={mode}
                value={mode}
              >
                {t(mode.toLowerCase())}
              </option>
            )
          })}
        </select>
      )
      const sort = (
        <select
          class={['select select-bordered select-sm']}
          v-model={proxySortType.value}
        >
          {Object.values(PROXY_SORT_TYPE).map((type) => {
            return (
              <option
                key={type}
                value={type}
              >
                {t(type)}
              </option>
            )
          })}
        </select>
      )

      const latencyTestAll = (
        <button
          class={twMerge('btn btn-circle btn-sm')}
          onClick={handlerClickLatencyTestAll}
        >
          {isAllLatencyTesting.value ? (
            <span class="loading loading-spinner loading-sm"></span>
          ) : (
            <BoltIcon class="h-4 w-4" />
          )}
        </button>
      )

      const toggleCollapseAll = (
        <button
          class={twMerge('btn btn-circle btn-sm')}
          onClick={handlerClickToggleCollapse}
        >
          {hasNotCollapsed.value ? (
            <ChevronUpIcon class="h-4 w-4" />
          ) : (
            <ChevronDownIcon class="h-4 w-4" />
          )}
        </button>
      )

      const searchInput = (
        <TextInput
          class="w-80"
          v-model={proxiesFilter.value}
          placeholder={t('search')}
          clearable={true}
        />
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
                {t('sortBy')}
                {sort}
              </div>
              <div class="flex items-center gap-2">
                {t('unavailableProxy')}
                <input
                  type="checkbox"
                  class="toggle"
                  v-model={hideUnavailableProxies.value}
                />
              </div>
              <div class="flex items-center gap-2">
                {t('manageHiddenGroup')}
                <input
                  class="toggle"
                  type="checkbox"
                  v-model={manageHiddenGroup.value}
                />
              </div>
              <div class="flex items-center gap-2">
                {t('automaticDisconnection')}
                <input
                  class="toggle"
                  type="checkbox"
                  v-model={automaticDisconnection.value}
                />
              </div>
            </div>
          </DialogWrapper>
        </>
      )

      if (props.horizontal) {
        if (isMiddleScreen.value) {
          return (
            <div class="flex flex-col gap-2 p-2">
              {hasProviders.value && (
                <div class="flex gap-2">
                  {tabs}
                  {upgradeAll}
                </div>
              )}
              <div class="flex w-full gap-2">
                {modeSelect}
                {searchInput}
                {settingsModal}
                {toggleCollapseAll}
                {latencyTestAll}
              </div>
            </div>
          )
        }
        return (
          <div class="flex flex-wrap gap-2 p-2">
            {hasProviders.value && tabs}
            {upgradeAll}
            {modeSelect}
            {searchInput}
            <div class="flex-1"></div>
            {settingsModal}
            {toggleCollapseAll}
            {latencyTestAll}
          </div>
        )
      }

      return (
        <div class="flex flex-col gap-2 p-2">
          {upgradeAll}
          {hasProviders.value && tabs}
          {
            <div class="flex gap-2">
              {modeSelect}
              {settingsModal}
              {toggleCollapseAll}
              {latencyTestAll}
            </div>
          }
          {<div class="flex gap-2">{searchInput}</div>}
        </div>
      )
    }
  },
})
