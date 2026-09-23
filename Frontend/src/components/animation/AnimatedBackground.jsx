const AnimatedBackground = ({ variant = 'aurora', className = '' }) => {
  if (variant === 'aurora') {
    return (
      <div className={`aurora ${className}`} aria-hidden="true">
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 grid-overlay opacity-40" />
      </div>
    );
  }

  if (variant === 'mesh') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(255,92,26,0.18) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[55%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(255,120,60,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>
    );
  }

  if (variant === 'light') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
        <div className="absolute top-[-30%] right-[-5%] w-[50%] h-[80%] opacity-60"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,92,26,0.18) 0%, transparent 60%)', filter: 'blur(70px)' }} />
      </div>
    );
  }

  return null;
};

export default AnimatedBackground;
