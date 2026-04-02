"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MapPin } from "lucide-react";

export default function Header() {

const [query, setQuery] = useState("");
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [cartCount, setCartCount] = useState(0);
const [cartOpen, setCartOpen] = useState(false);
const [merchantCarts, setMerchantCarts] = useState<any[]>([]);

/* LOCATION STATE */
const [locationOpen, setLocationOpen] = useState(false);
const [locationInput, setLocationInput] = useState("");
const [selectedLocation, setSelectedLocation] = useState("");

/* NEW: TAGLINE ANIMATION STATE */
const [showInlineTagline, setShowInlineTagline] = useState(false);

const router = useRouter();
const pathname = usePathname();

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

useEffect(() => {

const token = localStorage.getItem("access_token");
setIsLoggedIn(!!token);

const cachedCart = localStorage.getItem("mallyard_cart_cache");

if (cachedCart) {
try {
const parsed = JSON.parse(cachedCart);
updateCartState(parsed);
} catch {}
}

if (token && pathname !== "/login") {
fetchCart();
}

const storedLocation = localStorage.getItem("selectedLocation");
if (storedLocation) {
setSelectedLocation(storedLocation);
}

// 🔥 CLOSE DROPDOWNS ON NAVIGATION
setCartOpen(false);
setLocationOpen(false);

}, [pathname]);

useEffect(() => {
const handleCartUpdate = () => {
fetchCart();
};

window.addEventListener("cartUpdated", handleCartUpdate);

return () => {
window.removeEventListener("cartUpdated", handleCartUpdate);
};
}, []);

/* TAGLINE ANIMATION LOOP - FIXED MEMORY LEAK */
useEffect(() => {
let outerTimeout: NodeJS.Timeout;
let innerTimeout: NodeJS.Timeout;

const startCycle = () => {
  outerTimeout = setTimeout(() => {
    setShowInlineTagline(true);

    innerTimeout = setTimeout(() => {
      setShowInlineTagline(false);
      startCycle();
    }, 10000);

  }, 30000);
};

startCycle();

return () => {
  clearTimeout(outerTimeout);
  clearTimeout(innerTimeout);
};
}, []);

const updateCartState = (carts: any[]) => {

setMerchantCarts(carts);

let total = 0;

carts.forEach((merchant: any) => {
merchant.items.forEach((item: any) => {
total += item.quantity;
});
});

setCartCount(total);
};

const fetchCart = async () => {

try {
const token = localStorage.getItem("access_token");

// 🔥 TOKEN SAFETY
if (!token) {
  setCartCount(0);
  setMerchantCarts([]);
  return;
}

const res = await fetch(`${BASE_URL}/cart`, {
headers: {
Authorization: `Bearer ${token}`
}
});

// 🔥 SAFE JSON + ERROR HANDLING
if (!res.ok) {
  setCartCount(0);
  setMerchantCarts([]);
  return;
}

const data = await res.json().catch(() => ({}));

let carts = data.merchant_carts || [];

const enrichedCarts = await Promise.all(
carts.map(async (cart: any) => {
try {
const res = await fetch(
`${BASE_URL}/merchants/${cart.merchant_id}/storefront`
);

if (!res.ok) throw new Error();

const store = await res.json();

return {
...cart,
business_name:
store?.merchant?.business_name ||
`Merchant ${cart.merchant_id}`
};

} catch {
return {
...cart,
business_name: `Merchant ${cart.merchant_id}`
};
}
})
);

localStorage.setItem(
"mallyard_cart_cache",
JSON.stringify(enrichedCarts)
);

updateCartState(enrichedCarts);

} catch {
setCartCount(0);
setMerchantCarts([]);
}
};

const handleSearch = (e: React.FormEvent) => {

e.preventDefault();

if (!query.trim()) return;

const storedLocation = localStorage.getItem("selectedLocation");

if (storedLocation) {
router.push(`/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(storedLocation)}`);
} else {
router.push(`/search?q=${encodeURIComponent(query)}`);
}
};

const handleLogout = () => {
localStorage.removeItem("access_token");
localStorage.removeItem("mallyard_cart_cache");

setIsLoggedIn(false);
setCartCount(0);

router.push("/");
};

const handleLoginClick = () => {
router.push("/");
};

const applyLocation = () => {
  const value = locationInput.trim();
  if (!value) return;

  setSelectedLocation(value);
  localStorage.setItem("selectedLocation", value);

  window.dispatchEvent(new Event("locationChanged"));

  setLocationOpen(false);
};

return (

<header className="bg-emerald-900 text-white border-b border-emerald-800">

<div className="relative max-w-7xl mx-auto px-4 md:px-6 py-2 flex flex-wrap items-center gap-3 md:gap-4">

{/* LOGO */}
<Link href="/" className="flex items-center whitespace-nowrap relative shrink-0">

  <span className="text-lg md:text-xl font-semibold tracking-wide">
    <span className="mr-1">The</span>
    <span className="font-bold tracking-wide">MALLYARD</span>
  </span>

  <div className="hidden md:block overflow-hidden ml-3">
    <div
      className={`
        flex items-center gap-2
        transform transition-all duration-1000 ease-in-out
        ${showInlineTagline ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
      `}
    >
      <span className="h-4 w-px bg-emerald-700"></span>

      <span className="text-sm text-yellow-400 font-medium tracking-wide whitespace-nowrap">
        Find. Compare. Connect.
      </span>
    </div>
  </div>

</Link>

{/* ACTIONS (RIGHT SIDE TOP ON MOBILE) */}
<nav className="flex items-center gap-4 order-2 md:order-none md:ml-auto">

<Link href="/" className="hidden md:block text-white/80 hover:text-yellow-400 transition">
Home
</Link>

<Link href="/about" className="hidden md:block text-white/80 hover:text-yellow-400 transition">
About
</Link>

<Link href="/wishlist" className="text-yellow-400 text-xl hover:scale-110 transition">
♥
</Link>

<div className="relative">
<button onClick={() => setCartOpen(!cartOpen)} className="relative text-yellow-400 text-xl hover:scale-110 transition">
🛒
{cartCount > 0 && (
<span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs rounded-full px-1.5 py-0.5 font-semibold">
{cartCount}
</span>
)}
</button>

{cartOpen && (
<div className="absolute right-0 mt-3 w-64 bg-white text-black rounded-xl shadow-lg p-4 z-50">
<h3 className="font-semibold mb-3">Your Carts</h3>
{merchantCarts.length === 0 && (
<p className="text-sm text-gray-500">Your cart is empty</p>
)}
{merchantCarts.map((merchant) => (
<div
key={merchant.merchant_id}
onClick={() => {
setCartOpen(false);
router.push(`/cart/${merchant.merchant_id}`);
}}
className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded px-3 py-2 text-sm transition"
>
<span className="font-medium">{merchant.business_name}</span>
<span>🛒</span>
</div>
))}
</div>
)}
</div>

{!isLoggedIn && (
<button onClick={handleLoginClick} className="text-white/80 hover:text-yellow-400 transition">
Login
</button>
)}

{isLoggedIn && (
<>
<Link href="/account" className="text-yellow-400 text-xl hover:scale-110 transition">
👤
</Link>
<button onClick={handleLogout} className="text-white/80 hover:text-red-400 transition">
Logout
</button>
</>
)}

<div className="relative">
<button onClick={() => setLocationOpen(!locationOpen)} className="text-yellow-400 hover:scale-110 transition">
<MapPin size={20} />
</button>

{locationOpen && (
<div className="absolute right-0 mt-3 w-72 bg-white text-black rounded-xl shadow-lg p-4 z-50">
<p className="text-sm text-gray-600 mb-2">
Search for a location to explore listings (e.g. Bulawayo)
</p>
<input
value={locationInput}
onChange={(e) => setLocationInput(e.target.value)}
placeholder="Enter location..."
className="w-full border p-2 rounded mb-2"
/>
<button
onClick={applyLocation}
className="w-full bg-yellow-400 text-black py-2 rounded font-semibold hover:bg-yellow-500 transition"
>
Apply
</button>
</div>
)}
</div>

</nav>

{/* SEARCH (FULL WIDTH ON MOBILE) */}
<form
  onSubmit={handleSearch}
  className="
    w-full order-3
    md:absolute md:left-1/2 md:-translate-x-1/2
    md:w-full md:max-w-lg
    flex justify-center
  "
>
  <div className="relative w-full">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-4.3-4.3m1.3-5.7a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>

    <input
      type="text"
      autoComplete="off"
      placeholder="Search products, services, or merchants..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full rounded-full bg-white text-black pl-11 pr-4 py-2 text-sm shadow-sm focus:outline-none ring-1 ring-amber-300/40 focus:ring-2 focus:ring-amber-400/50"
    />

  </div>
</form>

</div>

</header>
);
}