import { useState } from "react";
import { toast } from "sonner";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";

import logo from "@/assets/NomNom.png";
import { logoutUser } from "@/api";
import { Button } from "@/components/ui/button";
import { clearAuth, getStoredUser } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { clearUserStores } from "@/lib/storeSync";
import { getCartQuantityTotal, useCartStore } from "@/store/cartStore";

const navItems = [
  { label: "Home", to: "/home" },
  { label: "About", to: "/about" },
  { label: "Menu", to: "/menu" },
  { label: "Orders", to: "/orders" },
];

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `transition-colors ${isActive ? "text-amber-700" : "text-stone-700 hover:text-amber-700"}`;

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = useCartStore((state) => getCartQuantityTotal(state.items));
  const user = getStoredUser();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Clear local state even if the backend session is already gone.
    } finally {
      clearAuth();
      clearUserStores();
      await queryClient.cancelQueries();
      queryClient.removeQueries({
        predicate: (query) => {
          const firstKey = query.queryKey[0];
          return firstKey === "cart" || firstKey === "orders" || firstKey === "current-user";
        },
      });
      toast.success("Logged out");
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/home" className="flex items-center gap-3">
          <img
            src={logo}
            alt="NomNom"
            className="size-12 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm"
          />
          <div>
            <p className="text-lg font-semibold tracking-tight text-stone-900">
              NomNom
            </p>
            <p className="text-sm text-stone-500">Fresh kitchen favorites</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClassName}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/cart" className="relative">
            <Button variant="outline" className="h-11 rounded-full px-4">
              <ShoppingCart className="mr-2 size-4" />
              Cart
            </Button>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-2 flex size-6 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          <div className="text-right">
            <p className="text-sm font-medium text-stone-900">
              {user?.name ?? "Guest"}
            </p>
            <p className="text-xs text-stone-500">{user?.email ?? "Signed in"}</p>
          </div>

          <Button
            variant="ghost"
            className="h-11 rounded-full px-4 text-stone-700 hover:bg-stone-100"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {isOpen ? (
        <div className="border-t border-stone-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClassName}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            <Link to="/cart" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="h-11 w-full rounded-full">
                <ShoppingCart className="mr-2 size-4" />
                Cart ({cartCount})
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="h-11 justify-start rounded-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
