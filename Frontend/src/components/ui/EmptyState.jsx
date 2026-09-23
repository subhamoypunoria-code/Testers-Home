const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center mb-5 text-[#ff5c1a]/70 bg-[rgba(255,92,26,0.06)] border border-[rgba(255,92,26,0.12)] backdrop-blur-md">
      <div className="absolute inset-0 rounded-full bg-[#ff5c1a] blur-2xl opacity-[0.08]" />
      {icon}
    </div>
    <h3 className="font-sora text-lg font-bold text-white mb-2">{title}</h3>
    {description && <p className="text-[13px] text-white/40 mb-6 max-w-[280px]">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
