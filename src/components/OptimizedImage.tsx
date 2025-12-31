import Image, { ImageProps } from 'next/image'
import { Media } from '@/payload-types'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  media: Media | string | number
  alt: string
  size?: 'thumbnail' | 'card' | 'playerCard' | 'small' | 'medium' | 'large' | 'hero' | 'xlarge'
  fallback?: string
}

export function OptimizedImage({
  media,
  alt,
  size = 'medium',
  fallback = '/placeholder.svg',
  ...props
}: OptimizedImageProps) {
  // Handle different media input types
  let imageUrl = fallback
  let blurDataURL: string | undefined

  if (typeof media === 'object' && media !== null) {
    // Use the specified size if available, otherwise use the original URL
    if (media.sizes && size in media.sizes) {
      const sizeData = media.sizes[size as keyof typeof media.sizes]
      if (sizeData && typeof sizeData === 'object' && 'url' in sizeData) {
        imageUrl = sizeData.url || fallback
      }
    } else if (media.url) {
      imageUrl = media.url
    }

    // Use thumbnail as blur placeholder if available
    if (
      media.sizes?.thumbnail &&
      typeof media.sizes.thumbnail === 'object' &&
      'url' in media.sizes.thumbnail
    ) {
      blurDataURL = media.sizes.thumbnail.url || undefined
    }
  } else if (typeof media === 'string') {
    imageUrl = media
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      {...props}
    />
  )
}
