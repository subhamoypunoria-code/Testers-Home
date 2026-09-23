import { getInitials } from '../../utils/helpers';

const COLORS = ['bg-[#ff5c1a]', 'bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500', 'bg-green-500'];

const Avatar = ({ user, size = 'sm', className = '' }) => {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const colorIndex = user?.name ? user.name.charCodeAt(0) % COLORS.length : 0;

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white/5 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} ${COLORS[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ring-2 ring-white/5 ${className}`}>
      {getInitials(user?.name)}
    </div>
  );
};

export default Avatar;
