import { motion } from 'framer-motion';

const Card = ({ children, className = '', onClick, style }) => (
  <motion.div
    whileHover={onClick ? { y: -3 } : {}}
    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    style={{
      background: 'rgba(17,17,17,0.65)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: 24,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
      ...style,
    }}
    onMouseEnter={onClick ? e => {
      e.currentTarget.style.borderColor = 'rgba(255,92,26,0.35)';
      e.currentTarget.style.boxShadow = '0 24px 48px -12px rgba(0,0,0,0.5), 0 0 40px rgba(255,92,26,0.12)';
    } : undefined}
    onMouseLeave={onClick ? e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.boxShadow = 'none';
    } : undefined}
    onClick={onClick}
    className={className}
  >
    {children}
  </motion.div>
);

const colorMap = {
  orange: { text: '#ffb59e', bg: 'rgba(255,92,26,0.12)' },
  blue:   { text: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  green:  { text: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  red:    { text: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  purple: { text: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
};

export const StatCard = ({ label, value, icon, color = 'orange', trend }) => {
  const c = colorMap[color] || colorMap.orange;
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'rgba(17,17,17,0.7)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: 24,
      }}
      className="hover:border-[rgba(255,92,26,0.3)] transition-colors duration-300"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
          <p className="font-sora" style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{value}</p>
          {trend && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>{trend}</p>}
        </div>
        <div style={{ padding: 12, borderRadius: 14, background: c.bg, color: c.text }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
