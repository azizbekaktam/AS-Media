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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-10 px-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-[var(--accent)] text-black px-6 py-3 rounded-xl shadow-lg transition-all duration-500 z-50">
          {toast}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        👑 <span className="text-[var(--primary)]">Admin Dashboard</span>
      </h1>

      {/* Search & Filters */}
      <div className="max-w-6xl mx-auto bg-[var(--surface)] p-6 rounded-2xl shadow-cinematic border border-[rgba(255,255,255,0.05)] mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="🔍 Foydalanuvchi qidirish (ism/email)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
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
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  filter === f.key
                    ? "bg-[var(--primary)] text-black shadow-lg"
                    : "bg-[rgba(255,255,255,0.05)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.1)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto bg-[var(--surface)] rounded-2xl shadow-cinematic overflow-hidden border border-[rgba(255,255,255,0.05)]">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-[var(--primary)] text-black">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Plan</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-[var(--muted)]">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u, i) => (
                <tr
                  key={u.id}
                  className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)] transition"
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{u?.name || (u?.email || "").split("@")[0]}</td>
                  <td className="p-3 text-[var(--muted)]">{u?.email || "—"}</td>
                  <td className="p-3">
                    <select
                      value={u?.role ?? "user"}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={u?.plan ?? "free"}
                      onChange={(e) => handlePlanChange(u.id, e.target.value)}
                      className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="inline-block w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-[var(--muted)] italic">
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
