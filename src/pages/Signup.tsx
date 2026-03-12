import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "../assets/NomNom.png";

type SignupResponse = {
  message?: string;
};

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return false;
    }

    if (name.length < 3) {
      toast.error("Name must be at least 3 characters");
      return false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await res.json()) as SignupResponse;

      if (!res.ok) {
        toast.error(data.message || "Signup failed");
        return;
      }

      toast.success("Account created successfully 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch {
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8E1]">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="NomNom" className="w-44" />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#E53935] mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">

          <input
            type="text"
            placeholder="Name"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#E53935]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#E53935]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#E53935]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E53935] hover:bg-[#FFC107] text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[#E53935] font-semibold">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;