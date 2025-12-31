import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { HeroBlockComponent } from '@/blocks/HeroBlock/Component'
import { FeaturedPlayersBlockComponent } from '@/blocks/FeaturedPlayersBlock/Component'
import { EventScheduleBlockComponent } from '@/blocks/EventScheduleBlock/Component'
import { SponsorsMarqueeBlockComponent } from '@/blocks/SponsorsMarqueeBlock/Component'
import { LatestNewsBlockComponent } from '@/blocks/LatestNewsBlock/Component'
import { PlayerGridBlockComponent } from '@/blocks/PlayerGridBlock/Component'
import { EventGridBlockComponent } from '@/blocks/EventGridBlock/Component'
import { SponsorTiersBlockComponent } from '@/blocks/SponsorTiersBlock/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  heroBlock: HeroBlockComponent,
  featuredPlayersBlock: FeaturedPlayersBlockComponent,
  eventScheduleBlock: EventScheduleBlockComponent,
  sponsorsMarqueeBlock: SponsorsMarqueeBlockComponent,
  latestNewsBlock: LatestNewsBlockComponent,
  playerGridBlock: PlayerGridBlockComponent,
  eventGridBlock: EventGridBlockComponent,
  sponsorTiersBlock: SponsorTiersBlockComponent,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
