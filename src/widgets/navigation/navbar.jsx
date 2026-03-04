'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Bell, Home, Film, Tv, Heart, Bookmark, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../../features/authentication/auth-provider';
import { UserAvatar } from '../../entities/user/ui/user-avatar';

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
          ? 'glass py-3' 
          : 'bg-transparent py-6'
      }`}>
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/" className="group">
              <span className="text-2xl md:text-3xl font-extrabold text-gradient transition-all duration-300 group-hover:scale-105 inline-block">
                AsMedia
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.name} href={item.href} className="relative group">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      active 
                        ? 'glass text-yellow-400' 
                        : 'text-white/70 hover:text-white hover:glass'
                    }`}>
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {active && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
              
              {user?.role === 'admin' && (
                <Link href="/Admin" className="relative group">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive('/Admin')
                      ? 'glass text-red-400' 
                      : 'text-white/70 hover:text-white hover:glass'
                  }`}>
                    <span className="text-lg font-bold">👑</span>
                    <span className="font-medium">Admin</span>
                  </div>
                  {isActive('/Admin') && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-full"
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
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </button>

              <button className="relative flex items-center justify-center w-10 h-10 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="hidden md:block">
                <UserAvatar user={user} />
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl glass hover:bg-white/10 text-white transition-all duration-300"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4"
              >
                <div className="glass rounded-xl p-4">
                  <input
                    type="text"
                    placeholder="Search movies, cartoons..."
                    className="input-primary w-full"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-gradient">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-xl glass hover:bg-white/10 text-white transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        active 
                          ? 'glass text-yellow-400' 
                          : 'text-white/70 hover:text-white hover:glass'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-8">
                <UserAvatar user={user} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
