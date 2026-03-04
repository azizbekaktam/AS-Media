// User entity types and constants

export const UserRoles = {
  USER: 'user',
  ADMIN: 'admin'
};

export const UserPlans = {
  FREE: 'free',
  PREMIUM: 'premium'
};

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Validation helpers
export const validateUser = (user) => {
  return user && 
         typeof user.uid === 'string' && 
         typeof user.email === 'string' &&
         Object.values(UserRoles).includes(user.role) &&
         Object.values(UserPlans).includes(user.plan);
};

export const isAdmin = (user) => {
  return validateUser(user) && user.role === UserRoles.ADMIN;
};

export const isPremium = (user) => {
  return validateUser(user) && user.plan === UserPlans.PREMIUM;
};
