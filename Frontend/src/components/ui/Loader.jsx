export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 14, md: 20, lg: 28 };
  const s = sizes[size];
  return (
    <div style={{
      width: s, height: s,
      border: '2px solid rgba(255,92,26,0.2)',
      borderTopColor: '#ff5c1a',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
};

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
    <Spinner size="lg" />
  </div>
);

export default PageLoader;
