"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell } from "lucide-react";
import Search from "./Search";
import UserProfile from "./UserPage";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserRole(snap.data().role);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Movies", href: "/Movies" },
    { name: "Cartoon", href: "/Cartoon" },
    { name: "Like", href: "/LikedPage" }, // ✅ to‘g‘rilangan link
    { name: "WatchList", href: "/WatchList" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border-b border-yellow-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="font-extrabold text-2xl tracking-wide">
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            AsMedia
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex gap-8 font-medium text-gray-200 items-center">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="relative group">
              <li
                className={`cursor-pointer transition-all duration-300 ${
                  pathname === item.href
                    ? "text-yellow-400 font-semibold"
                    : "hover:text-yellow-300"
                }`}
              >
                {item.name}
              </li>
              <span
                className={`absolute left-0 -bottom-1 h-[2px] bg-yellow-400 rounded-full transition-all duration-300 ${
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          ))}

          {userRole === "admin" && (
            <Link href="/Admin" className="relative group">
              <li
                className={`cursor-pointer transition-all duration-300 ${
                  pathname === "/Admin"
                    ? "text-yellow-400 font-semibold"
                    : "hover:text-yellow-300"
                }`}
              >
                Admin
              </li>
              <span className="absolute left-0 -bottom-1 w-0 group-hover:w-full h-[2px] bg-yellow-400 transition-all duration-300"></span>
            </Link>
          )}

          <li className="relative">
            <Bell className="w-5 h-5 cursor-pointer hover:text-yellow-400 transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </li>
        </ul>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-40 lg:w-56">
            <Search />
          </div>

          <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden">
            <UserProfile />
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-yellow-400 hover:text-yellow-300 transition"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-yellow-500/20 shadow-inner px-6 py-4 space-y-4 text-gray-200 animate-fade-in">
          <Search />
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block transition-all ${
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
              className="block hover:text-yellow-300"
            >
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
