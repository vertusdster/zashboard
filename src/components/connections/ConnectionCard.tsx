import { disconnectByIdAPI } from '@/api'
import { useConnections } from '@/composables/connections'
import { CONNECTIONS_TABLE_ACCESSOR_KEY, PROXY_CHAIN_DIRECTION } from '@/constant'
import {
  fromNow,
  getDestinationFromConnection,
  getIPLabelFromMap,
  getNetworkTypeFromConnection,
  getProcessFromConnection,
  prettyBytesHelper,
} from '@/helper'
import { connectionCardLines, proxyChainDirection } from '@/store/settings'
import type { Connection } from '@/types'
import {
  ArrowDownCircleIcon,
  ArrowDownIcon,
  ArrowRightCircleIcon,
  ArrowUpCircleIcon,
  ArrowUpIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { first, last } from 'lodash'
import { defineComponent } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
import ProxyName from '../proxies/ProxyName.vue'

export default defineComponent<{
  conn: Connection
}>({
  props: {
    conn: Object,
  },
  name: 'ConnectionCard',
  setup(props) {
    const { handlerInfo } = useConnections()

    return () => {
      const conn = props.conn
      const metadata = conn.metadata
      const componentMap: Record<CONNECTIONS_TABLE_ACCESSOR_KEY, JSX.Element> = {
        [CONNECTIONS_TABLE_ACCESSOR_KEY.Host]: (
          <span class="w-80 grow truncate text-primary/80">
            {metadata.host || metadata.sniffHost || metadata.destinationIP}:
            {metadata.destinationPort}
          </span>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.Destination]: (
          <span class="w-80 grow truncate break-all">{getDestinationFromConnection(conn)}</span>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.SourceIP]: (
          <span class="w-40 grow truncate break-all">{getIPLabelFromMap(metadata.sourceIP)}</span>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.SourcePort]: (
          <span class="w-20 grow truncate break-all">{metadata.sourcePort}</span>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.SniffHost]: (
          <span class="w-80 grow truncate break-all">{metadata.sniffHost || '-'}</span>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.Type]: (
          <span class="w-60 grow truncate break-all">{getNetworkTypeFromConnection(conn)}</span>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.Rule]: (
          <span class="w-80 grow truncate break-all">
            {conn.rule}
            {conn.rulePayload && <>: {conn.rulePayload}</>}
          </span>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.Process]: (
          <span class="w-60 grow truncate break-all">{getProcessFromConnection(conn)}</span>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.Chains]: (
          <span
            class={[
              'flex w-80 grow items-center gap-1 truncate break-all',
              proxyChainDirection.value === PROXY_CHAIN_DIRECTION.REVERSE &&
                'flex-row-reverse justify-end',
            ]}
          >
            {<ProxyName name={last(conn.chains)!} />}
            {last(conn.chains) !== first(conn.chains) && (
              <>
                <ArrowRightCircleIcon class="h-4 w-4 shrink-0"></ArrowRightCircleIcon>
                {<ProxyName name={first(conn.chains)!} />}
              </>
            )}
          </span>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.Download]: (
          <div class="flex items-center gap-1 whitespace-nowrap">
            {prettyBytesHelper(conn.download)}
            <ArrowDownIcon class="h-4 w-4 text-success" />
          </div>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.Upload]: (
          <div class="flex items-center gap-1 whitespace-nowrap">
            {prettyBytesHelper(conn.upload)}
            <ArrowUpIcon class="h-4 w-4 text-info" />
          </div>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.DlSpeed]: (
          <div class="flex items-center gap-1 whitespace-nowrap">
            {prettyBytesHelper(conn.downloadSpeed)}/s
            <ArrowDownCircleIcon class="h-4 w-4 text-success" />
          </div>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.UlSpeed]: (
          <div class="flex items-center gap-1 whitespace-nowrap">
            {prettyBytesHelper(conn.uploadSpeed)}/s
            <ArrowUpCircleIcon class="h-4 w-4 text-info" />
          </div>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.ConnectTime]: (
          <div class="gap-1 whitespace-nowrap">{fromNow(conn.start)}</div>
        ),
        [CONNECTIONS_TABLE_ACCESSOR_KEY.Close]: (
          <button
            class="btn btn-circle btn-xs"
            onClick={(e) => {
              e.stopPropagation()
              disconnectByIdAPI(conn.id)
            }}
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        ),
      }
      return (
        <div
          class="card cursor-pointer gap-1 p-1"
          onClick={() => handlerInfo(conn)}
        >
          {connectionCardLines.value.map((line) => (
            <div class="flex items-center gap-1 text-sm">
              {line.map((key) => {
                return componentMap[key]
              })}
            </div>
          ))}
        </div>
      )
    }
  },
})
