import type { AdminViewServerProps } from 'payload'

import { Gutter } from '@payloadcms/ui'
import { DefaultTemplate } from '@payloadcms/next/templates'
import React from 'react'

import { ManualTransfersClient } from './ManualTransfersClient'

export function ManualTransfersView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <ManualTransfersClient />
      </Gutter>
    </DefaultTemplate>
  )
}

export default ManualTransfersView
