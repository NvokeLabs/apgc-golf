import React from 'react'
import Image from 'next/image'

const Logo = () => {
  return (
    <Image
      src="/apgc-logo.png"
      alt="APGC Golf"
      width={150}
      height={150}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}

export default Logo
