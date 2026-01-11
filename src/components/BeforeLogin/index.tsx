import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: '24px',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <span
          style={{
            backgroundColor: '#ed5f24',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          APGC
        </span>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#171046',
          }}
        >
          Golf Admin
        </span>
      </div>

      {/* Welcome Text */}
      <p
        style={{
          color: '#717182',
          fontSize: '14px',
          margin: 0,
        }}
      >
        Sign in to manage your golf events, players, and sponsors.
      </p>
    </div>
  )
}

export default BeforeLogin
