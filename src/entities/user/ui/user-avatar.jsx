import { validateUser } from '../model/types';

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-20 h-20 text-2xl'
};

const colorClasses = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

function getUserColor(uid) {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorClasses[Math.abs(hash) % colorClasses.length];
}

export function UserAvatar({ user, size = 'md', className = '' }) {
  if (!validateUser(user)) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
        ?
      </div>
    );
  }

  const sizeClass = sizeClasses[size];
  const bgColor = getUserColor(user.uid);
  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.name || 'User Avatar'}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
      {initial}
    </div>
  );
}
