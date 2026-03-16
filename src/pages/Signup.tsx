import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import logo from "@/assets/NomNom.png";
import { fetchCart, fetchOrders, signupUser } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { syncCartFromServer, syncOrdersFromServer, syncUserStores } from "@/lib/storeSync";
import { signupFormSchema } from "@/types/auth";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedForm = signupFormSchema.safeParse({ name, email, password });

    if (!parsedForm.success) {
      toast.error(parsedForm.error.issues[0]?.message ?? "Please check your form");
      return;
    }

    try {
      setLoading(true);
      await queryClient.cancelQueries();
      queryClient.removeQueries({
        predicate: (query) => {
          const firstKey = query.queryKey[0];
          return firstKey === "cart" || firstKey === "orders" || firstKey === "current-user";
        },
      });
      const data = await signupUser(parsedForm.data);

      if (data.token && data.user) {
        saveAuth(data.token, data.user);
        syncUserStores(data.user);
        syncCartFromServer(await fetchCart());
        syncOrdersFromServer(await fetchOrders());
        toast.success("Account created successfully");
        navigate("/home");
        return;
      }

      toast.success(data.message ?? "Account created successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#fffaf5_0%,_#ffedd5_45%,_#fde68a_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[36px] border border-stone-200 bg-white p-8 shadow-[0_30px_70px_-40px_rgba(28,25,23,0.5)] sm:p-10">
          <div className="mb-8 flex items-center gap-4">
            <img
              src={logo}
              alt="NomNom"
              className="size-16 rounded-2xl border border-stone-200 bg-white p-2"
            />
            <div>
              <p className="text-2xl font-semibold text-stone-900">Create account</p>
              <p className="text-sm text-stone-500">Join NomNom and start ordering</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Name</label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                className="h-12 rounded-2xl border-stone-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-2xl border-stone-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="h-12 rounded-2xl border-stone-300"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full bg-stone-900 text-white hover:bg-amber-600"
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-stone-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-amber-700 hover:text-amber-800">
              Login here
            </Link>
          </p>
        </section>

        <section className="hidden space-y-6 lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            Join the Table
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-stone-900">
            Create your account and keep your favorite meals, cart, and orders in one place.
          </h1>
          <p className="max-w-lg text-base leading-8 text-stone-600">
            The signup flow is intentionally simple and beginner-friendly, but still
            polished enough to feel like a real restaurant website.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Signup;
