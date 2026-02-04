/**
 * Logo Component - Geek Style
 * Cargo X CCN Logo with orange accent
 */
export const Logo = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: 100
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(255, 165, 0, 0.3)'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}>
        <span style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#FFA500',
          letterSpacing: '-0.02em',
          lineHeight: 1
        }}>
          CARGO X
        </span>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 400,
          color: '#71717a',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          lineHeight: 1
        }}>
          CCN Platform
        </span>
      </div>
    </div>
  );
};
