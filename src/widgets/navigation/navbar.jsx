import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Bell, Home, Film, Tv, Heart, Bookmark, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../../features/authentication/auth-provider';
import { UserAvatar } from '../../entities/user/ui/user-avatar';
import { GlassCard } from '../../shared/ui/glass-card';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useAuthContext();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Movies', href: '/Movies', icon: Film },
    { name: 'Cartoon', href: '/Cartoon', icon: Tv },
    { name: 'Like', href: '/LikedPage', icon: Heart },
    { name: 'WatchList', href: '/WatchList', icon: Bookmark },
    { name: 'History', href: '/History', icon: History },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="group">
              <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 inline-block">
                AsMedia
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.name} href={item.href} className="relative group">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      active 
                        ? 'bg-yellow-400/20 text-yellow-400' 
                        : 'text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}>
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {active && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
              
              {user?.role === 'admin' && (
                <Link href="/Admin" className="relative group">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive('/Admin')
                      ? 'bg-red-400/20 text-red-400' 
                      : 'text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}>
                    <span className="text-lg font-bold">👑</span>
                    <span className="font-medium">Admin</span>
                  </div>
                  {isActive('/Admin') && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </button>

              <button className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all duration-300">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="hidden md:block">
                <UserAvatar user={user} />
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-300"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-40 p-4"
          >
            <GlassCard className="max-w-2xl mx-auto p-4">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                autoFocus
              />
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed top-0 left-0 w-72 h-full glass-card border-r border-white/10 z-50 pt-20"
          >
            <div className="p-6 space-y-2">
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                />
              </div>
              
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      active
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              {user?.role === 'admin' && (
                <Link
                  href="/Admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive('/Admin')
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg font-bold">👑</span>
                  <span className="font-medium">Admin</span>
                </Link>
              )}
              
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3">
                  <UserAvatar user={user} />
                  <div className="flex-1">
                    <p className="text-white font-medium">Profile</p>
                    <p className="text-gray-400 text-sm">Manage your account</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
