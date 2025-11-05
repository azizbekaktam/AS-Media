"use client";
import { useState } from "react";
import { auth, db } from "../../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      localStorage.setItem("token", token);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        localStorage.setItem("role", userData.role || "user");
      } else {
        localStorage.setItem("role", "user");
      }

      router.push("/Movies");
    } catch (err) {
      setError("Email yoki parol noto‘g‘ri ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-4xl font-extrabold text-white text-center mb-4 drop-shadow-md">
          Kino Dunyosiga Xush Kelibsiz 🎬
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Hisobingizga kirish orqali barcha filmlarni kuzatib boring!
        </p>

        <motion.form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:border-gray-400 focus:ring focus:ring-gray-500/30 outline-none p-3 rounded-xl transition"
            required
          />
          <input
            type="password"
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:border-gray-400 focus:ring focus:ring-gray-500/30 outline-none p-3 rounded-xl transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Yuklanmoqda..." : "Login"}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-center font-medium mt-2"
            >
              {error}
            </motion.p>
          )}
        </motion.form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Hali ro‘yxatdan o‘tmaganmisiz?{" "}
          <Link
            href="/RegPage"
            className="text-blue-400 font-semibold hover:underline"
          >
            Ro‘yxatdan o‘tish
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
