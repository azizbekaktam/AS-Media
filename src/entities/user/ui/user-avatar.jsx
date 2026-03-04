import { FaUserCircle } from 'react-icons/fa';
import { validateUser } from '../model/types';

export function UserAvatar({ user, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (!user || !validateUser(user)) {
    return (
      <div className={`${sizeClasses[size]} rounded-full glass flex-center`}>
        <FaUserCircle className="text-white/60" />
      </div>
    );
  }

  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email
      ? user.email.slice(0, 2).toUpperCase()
      : 'U';

  const getAvatarColor = (name) => {
    if (!name) return 'from-gray-500 to-gray-600';
    
    const colors = [
      'from-red-500 to-red-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden relative group cursor-pointer`}>
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || 'User'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(user.displayName)} flex-center text-white font-bold ${textSizes[size]}`}>
          {initials}
        </div>
      )}
      
      {/* Online indicator */}
      {user.online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900"></div>
      )}
      
      {/* Premium badge */}
      {user.plan === 'premium' && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex-center">
          <span className="text-black text-xs font-bold">P</span>
        </div>
      )}
    </div>
  );
}
