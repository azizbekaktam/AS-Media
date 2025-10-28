"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import LogOut from "./LogOut";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const refDoc = doc(db, "users", currentUser.uid);
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  if (!user) return null;

  const displayName = userData?.name || user.email.split("@")[0] || "No Name";
  const createdAt = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleString()
    : "Unknown";

  return (
    <div ref={ref} className="relative">
      {/* Avatar */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 shadow-md cursor-pointer hover:scale-105 transition-transform focus:outline-none"
        aria-expanded={open}
        aria-label="Open profile menu"
      >
        {userData?.photoURL ? (
          <img
            src={userData.photoURL}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 z-60 animate-fadeIn space-y-4"
          role="menu"
        >
          <div className="flex justify-center">
            {userData?.photoURL ? (
              <img
                src={userData.photoURL}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover border-4 border-yellow-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center text-2xl font-bold text-black shadow-md">
                {displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm text-center">
            <h2 className="text-lg font-semibold">{displayName}</h2>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm text-center">
              <div className="text-xs text-gray-500">Plan</div>
              <div className="mt-1 text-sm font-medium">
                {userData?.plan ? userData.plan.toUpperCase() : "FREE"}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm text-center">
              <div className="text-xs text-gray-500">Role</div>
              <div className="mt-1 text-sm font-medium">
                {userData?.role ? userData.role.toUpperCase() : "USER"}
              </div>
            </div>

            <div className="col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm text-center">
              <div className="text-xs text-gray-500">Joined</div>
              <div className="mt-1 text-xs">{createdAt}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:scale-105 transition"
            >
              Profile
            </button>

            <button
              onClick={() => {
                setOpen(false);
                router.push("/history");
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:scale-105 transition"
            >
              History
            </button>

            <div className="flex-1">
              <LogOut />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
