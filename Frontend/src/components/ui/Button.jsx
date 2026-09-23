import { motion } from 'framer-motion';

const variants = {
  primary: {
    background: '#ff5c1a',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 0 24px rgba(255, 92, 26, 0.25)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.06)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  ghost: {
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  danger: {
    background: 'rgba(239,68,68,0.1)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.2)',
  },
  success: {
    background: 'rgba(16,185,129,0.1)',
    color: '#34d399',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  white: {
    background: '#ffffff',
    color: '#111111',
    border: 'none',
  },
};

const sizes = {
  xs: { padding: '5px 12px', fontSize: 11 },
  sm: { padding: '7px 16px', fontSize: 12 },
  md: { padding: '9px 20px', fontSize: 13 },
  lg: { padding: '12px 28px', fontSize: 14 },
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading, disabled, icon, style: extStyle, ...props }) => {
  const isPrimary = variant === 'primary';

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { y: -2, boxShadow: isPrimary ? '0 0 40px rgba(255, 92, 26, 0.45), 0 12px 32px -8px rgba(255, 92, 26, 0.3)' : undefined }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 9999,
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        ...variants[variant],
        ...sizes[size],
        ...extStyle,
      }}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading
        ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : icon}
      {children}
    </motion.button>
  );
};

export default Button;
