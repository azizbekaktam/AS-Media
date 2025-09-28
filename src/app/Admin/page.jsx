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
import Spinder from "../components/Spinder";

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
        // current user docni aniq olish (snap orqali whole collection qidirish yomon)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // optimistic update
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

  // Safe filter: email/name bo'lmasa bo'sh stringga aylantirib toLowerCase chaqiramiz
  const q = search.trim().toLowerCase();
  const filteredUsers = users
    .filter((u) => {
      const email = (u?.email ?? "").toLowerCase();
      const name = (u?.name ?? "").toLowerCase();
      // agar search bo'sh bo'lsa ham hamma keladi ('' includes => true)
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
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Admin Panel 
      </h1>

      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <Spinder />
      ) : (
        <>
          {/* Search & Filters */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <input
              type="text"
              placeholder="Foydalanuvchi qidirish (ism/email)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 p-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />

            <div className="flex flex-wrap gap-2">
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === f.key
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-yellow-400 text-black text-left">
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, i) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3">
                        {u?.name || (u?.email || "").split("@")[0]}
                      </td>
                      <td className="p-3">{u?.email || "—"}</td>
                      <td className="p-3">
                        <select
                          value={u?.role ?? "user"}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
                          className="p-1 rounded border border-gray-300"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={u?.plan ?? "free"}
                          onChange={(e) =>
                            handlePlanChange(u.id, e.target.value)
                          }
                          className="p-1 rounded border border-gray-300"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      Hech qanday foydalanuvchi topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

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
        // current user docni aniq olish (snap orqali whole collection qidirish yomon)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // optimistic update
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
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
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, plan: newPlan } : u)));
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

  // Safe filter: email/name bo'lmasa bo'sh stringga aylantirib toLowerCase chaqiramiz
  const q = search.trim().toLowerCase();
  const filteredUsers = users
    .filter((u) => {
      const email = (u?.email ?? "").toLowerCase();
      const name = (u?.name ?? "").toLowerCase();
      // agar search bo'sh bo'lsa ham hamma keladi ('' includes => true)
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
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Panel 👑</h1>

      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
        </div>
      ) : (
        <>
          {/* Search & Filters */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <input
              type="text"
              placeholder="Foydalanuvchi qidirish (ism/email)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 p-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />

            <div className="flex flex-wrap gap-2">
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === f.key ? "bg-yellow-400 text-black" : "bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-yellow-400 text-black text-left">
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, i) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3">{u?.name || (u?.email || "").split("@")[0]}</td>
                      <td className="p-3">{u?.email || "—"}</td>
                      <td className="p-3">
                        <select
                          value={u?.role ?? "user"}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="p-1 rounded border border-gray-300"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={u?.plan ?? "free"}
                          onChange={(e) => handlePlanChange(u.id, e.target.value)}
                          className="p-1 rounded border border-gray-300"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      Hech qanday foydalanuvchi topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
