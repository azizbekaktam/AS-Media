"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell } from "lucide-react";
import Search from "./Search";
import UserProfile from "./UserPage";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setUserRole(snap.data().role);
      }
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Movies", href: "/Movies" },
    { name: "Cartoon", href: "/Cartoon" },
    { name: "Like", href: "/LikedPage" },
    { name: "WatchList", href: "/WatchList" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="font-extrabold text-2xl tracking-wide">
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent transition-all hover:from-yellow-300 hover:to-yellow-500">
            AsMedia
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex gap-8 font-medium text-gray-200 items-center">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="relative group">
              <li
                className={`cursor-pointer transition-all duration-500 ease-in-out ${
                  pathname === item.href
                    ? "text-yellow-400 font-semibold"
                    : "hover:text-yellow-300"
                }`}
              >
                {item.name}
              </li>
              <span
                className={`absolute left-0 -bottom-1 h-[2px] bg-yellow-400 rounded-full transition-all duration-500 ease-in-out ${
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          ))}

          {userRole === "admin" && (
            <Link href="/Admin" className="relative group">
              <li
                className={`cursor-pointer transition-all duration-500 ease-in-out ${
                  pathname === "/Admin"
                    ? "text-yellow-400 font-semibold"
                    : "hover:text-yellow-300"
                }`}
              >
                Admin
              </li>
              <span className="absolute left-0 -bottom-1 w-0 group-hover:w-full h-[2px] bg-yellow-400 transition-all duration-500 ease-in-out"></span>
            </Link>
          )}

          {/* Bell Notification */}
          <li className="relative">
            <Bell className="w-5 h-5 cursor-pointer hover:text-yellow-400 transition-all duration-300 hover:scale-110" />
            <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </li>
        </ul>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-40 lg:w-56">
            <Search />
          </div>

          <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden transition-all hover:scale-105 hover:ring-2 hover:ring-yellow-500">
            <UserProfile />
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-yellow-400 hover:text-yellow-300 transition-all hover:scale-110"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="md:hidden fixed top-16 left-0 w-full bg-gray-900/95 backdrop-blur-md border-t border-gray-800 shadow-inner px-6 py-4 space-y-4 text-gray-200"
          >
            <Search />
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block transition-all duration-500 ${
                  pathname === item.href
                    ? "text-yellow-400 font-semibold"
                    : "hover:text-yellow-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {userRole === "admin" && (
              <Link
                href="/Admin"
                onClick={() => setIsOpen(false)}
                className="block hover:text-yellow-300 transition-all duration-500"
              >
                Admin Panel
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
