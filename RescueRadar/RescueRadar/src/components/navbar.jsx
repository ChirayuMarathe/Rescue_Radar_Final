// Removed custom Button import
import { Shield } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";

export function Navbar() {
  const navLinks = [
    { id: "home", label: "Home" },
    { id: "resources", label: "Resources" },
    { id: "join-network", label: "HelpUs" },
  ];
  const router = useRouter();
  return (
    <nav
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95vw] max-w-6xl mx-auto flex items-center space-x-8 px-6 py-3 rounded-2xl shadow-xl bg-white/70 backdrop-blur-md border border-orange-100"
      style={{
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center space-x-2 group mr-6"
      >
        <Shield className="h-8 w-8 text-orange-500 group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
          RescueRadar
        </span>
      </Link>
      {/* Nav Links */}
      <div className="flex-1 flex items-center space-x-6">
        {navLinks.map((link) => (
          <a
            key={link.id}
            href={link.id === "home" ? "/" : `#${link.id}`}
            className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            onClick={(e) => {
              e.preventDefault();
              if (link.id === "home") {
                router.push("/");
              } else {
                router.push("/");
                setTimeout(() => {
                  const el = document.getElementById(link.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }, 100);
              }
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
      <button
        type="button"
        className="bg-blue-500 hover:bg-blue-600 shadow-blue-200 shadow-md text-white font-semibold px-4 py-2 rounded-lg transition-colors mr-2"
        onClick={() => router.push("/reports-map")}
      >
        Reports Map
      </button>
      <button
        type="button"
        className="bg-orange-500 hover:bg-orange-600 shadow-orange-200 shadow-md text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        onClick={() => router.push("/report")}
      >
        Report Form
      </button>
    </nav>
  );
}
