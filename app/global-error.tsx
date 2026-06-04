'use client'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          color: 'rgb(255 255 255 / 0.92)',
          fontFamily: 'ui-monospace, monospace',
          padding: '24px'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '28rem',
            border: '1px solid rgb(255 32 64 / 0.6)',
            backgroundColor: 'rgb(0 240 255 / 0.04)',
            borderRadius: '2px',
            padding: '24px'
          }}
        >
          <div
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgb(255 32 64 / 0.7)'
            }}
          >
            ▸ CRITICAL SYSTEM FAULT
          </div>
          <h1
            style={{
              margin: '8px 0 0',
              fontSize: '28px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#ff2040',
              textShadow: '0 0 14px rgb(255 32 64 / 0.7)'
            }}
          >
            System Offline
          </h1>
          <p style={{ marginTop: '16px', fontSize: '12px', lineHeight: 1.6, color: 'rgb(255 255 255 / 0.7)' }}>
            The application shell failed to load. Re-initialize to attempt recovery.
          </p>
          {error.digest && (
            <div
              style={{
                marginTop: '12px',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgb(255 32 64 / 0.5)'
              }}
            >
              ▸ DIGEST {error.digest}
            </div>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '24px',
              cursor: 'pointer',
              border: '1px solid rgb(0 240 255 / 0.6)',
              backgroundColor: '#0e0e16',
              borderRadius: '2px',
              padding: '8px 16px',
              fontFamily: 'inherit',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#00f0ff',
              textShadow: '0 0 8px rgb(0 240 255 / 0.5)'
            }}
          >
            ▸ RE-INITIALIZE
          </button>
        </div>
      </body>
    </html>
  )
}
