"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../firebase";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/LoginPage");
        return;
      }

      setUser(currentUser);

      try {
        const curSnap = await getDoc(doc(db, "users", currentUser.uid));
        const curData = curSnap.exists() ? curSnap.data() : null;
        setUserData(curData);

        if (!curData || curData.role !== "admin") {
          router.push("/");
          return;
        }

        await fetchUsers();
      } catch (err) {
        console.error("Admin check error:", err);
        showToast("Server bilan bogʻlanishda xato");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const qSnap = await getDocs(collection(db, "users"));
      const arr = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(arr);
    } catch (err) {
      console.error("Fetch users error:", err);
      showToast("Foydalanuvchilarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
      await updateDoc(doc(db, "users", id), { role: newRole });
      showToast("Role o'zgartirildi ✅");
    } catch (err) {
      console.error(err);
      showToast("Role o'zgarmadi ❌");
      fetchUsers();
    }
  };

  const handlePlanChange = async (id, newPlan) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, plan: newPlan } : u))
      );
      await updateDoc(doc(db, "users", id), { plan: newPlan });
      showToast("Plan o'zgartirildi ✅");
    } catch (err) {
      console.error(err);
      showToast("Plan o'zgarmadi ❌");
      fetchUsers();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ushbu foydalanuvchini o‘chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("Foydalanuvchi o‘chirildi ❌");
    } catch (err) {
      console.error(err);
      showToast("O‘chirishda xato ❌");
      fetchUsers();
    }
  };

  const q = search.trim().toLowerCase();
  const filteredUsers = users
    .filter((u) => {
      const email = (u?.email ?? "").toLowerCase();
      const name = (u?.name ?? "").toLowerCase();
      return email.includes(q) || name.includes(q);
    })
    .filter((u) => {
      if (filter === "all") return true;
      if (filter === "admin") return u?.role === "admin";
      if (filter === "user") return u?.role === "user";
      if (filter === "premium") return u?.plan === "premium";
      if (filter === "free") return (u?.plan ?? "free") === "free";
      return true;
    });

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen py-10 px-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide z-50">
          {toast}
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 underline underline-offset-8 decoration-yellow-400">
        👑 Admin Dashboard
      </h1>

      {/* Search & Filters */}
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-md border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="🔍 Foydalanuvchi qidirish (ism/email)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm"
          />
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: "all", label: "Barchasi" },
              { key: "admin", label: "Adminlar" },
              { key: "user", label: "Userlar" },
              { key: "premium", label: "Premium" },
              { key: "free", label: "Free" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filter === f.key
                    ? "bg-yellow-400 text-black shadow"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-yellow-400 text-black">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Plan</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u, i) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-yellow-50 transition"
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium text-gray-800">
                    {u?.name || (u?.email || "").split("@")[0]}
                  </td>
                  <td className="p-3">{u?.email || "—"}</td>
                  <td className="p-3">
                    <select
                      value={u?.role ?? "user"}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="p-2 rounded-lg border border-gray-300 bg-gray-50"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={u?.plan ?? "free"}
                      onChange={(e) => handlePlanChange(u.id, e.target.value)}
                      className="p-2 rounded-lg border border-gray-300 bg-gray-50"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="inline-block w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-6 text-center text-gray-500 italic"
                >
                  Hech qanday foydalanuvchi topilmadi 🙁
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
