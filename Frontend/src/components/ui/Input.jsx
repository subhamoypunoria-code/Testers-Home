const inputBase = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 13,
  color: '#ffffff',
  transition: 'border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
  outline: 'none',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

const labelStyle = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.55)',
  fontWeight: 600,
  letterSpacing: '0.03em',
  display: 'block',
  marginBottom: 8,
};

const errorStyle = { fontSize: 11, color: '#f87171', marginTop: 4 };

const focusHandlers = {
  onFocus: e => {
    e.target.style.borderColor = 'rgba(255,92,26,0.55)';
    e.target.style.boxShadow = '0 0 0 3px rgba(255,92,26,0.12)';
    e.target.style.background = 'rgba(255,255,255,0.08)';
  },
  onBlur: e => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'rgba(255,255,255,0.05)';
  },
};

const Input = ({ label, error, icon, className = '', style: extStyle, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {label && <label style={labelStyle}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(226,226,226,0.3)', display: 'flex' }}>
          {icon}
        </span>
      )}
      <input
        style={{
          ...inputBase,
          ...(error ? { borderColor: 'rgba(248,113,113,0.5)' } : {}),
          ...(icon ? { paddingLeft: 36 } : {}),
          ...extStyle,
        }}
        className={className}
        {...focusHandlers}
        {...props}
      />
    </div>
    {error && <p style={errorStyle}>{error}</p>}
  </div>
);

export const Textarea = ({ label, error, className = '', style: extStyle, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {label && <label style={labelStyle}>{label}</label>}
    <textarea
      style={{
        ...inputBase,
        resize: 'none',
        ...(error ? { borderColor: 'rgba(248,113,113,0.5)' } : {}),
        ...extStyle,
      }}
      rows={4}
      className={className}
      {...focusHandlers}
      {...props}
    />
    {error && <p style={errorStyle}>{error}</p>}
  </div>
);

export const Select = ({ label, error, children, className = '', style: extStyle, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {label && <label style={labelStyle}>{label}</label>}
    <select
      style={{
        ...inputBase,
        cursor: 'pointer',
        colorScheme: 'dark',
        paddingRight: 36,
        ...(error ? { borderColor: 'rgba(248,113,113,0.5)' } : {}),
        ...extStyle,
      }}
      className={`th-select ${className}`}
      {...focusHandlers}
      {...props}
    >
      {children}
    </select>
    {error && <p style={errorStyle}>{error}</p>}
  </div>
);

export default Input;
