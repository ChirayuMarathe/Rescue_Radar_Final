import { useState } from "react";
import { Shield, Menu, X } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { id: "home", label: "Home" },
    { id: "resources", label: "Resources" },
    { id: "join-network", label: "HelpUs" },
  ];
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (e, linkId) => {
    e.preventDefault();
    closeMenu();
    
    if (linkId === "home") {
      router.push("/");
    } else {
      router.push("/");
      setTimeout(() => {
        const el = document.getElementById(linkId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <>
      {/* Desktop & Tablet Navbar */}
      <nav
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95vw] max-w-6xl mx-auto hidden lg:flex items-center justify-between px-6 py-3 rounded-2xl shadow-xl bg-white/80 backdrop-blur-md border border-orange-100"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <Shield className="h-8 w-8 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="text-xl xl:text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
            RescueRadar
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.id === "home" ? "/" : `#${link.id}`}
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
              onClick={(e) => handleNavClick(e, link.id)}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 shadow-blue-200 shadow-md text-white font-semibold px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base"
            onClick={() => router.push("/reports-map")}
          >
            <span className="hidden xl:inline">Reports Map</span>
            <span className="xl:hidden">Map</span>
          </button>
          <button
            type="button"
            className="bg-orange-500 hover:bg-orange-600 shadow-orange-200 shadow-md text-white font-semibold px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base"
            onClick={() => router.push("/report")}
          >
            <span className="hidden xl:inline">Report Form</span>
            <span className="xl:hidden">Report</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center space-x-2 group" onClick={closeMenu}>
            <Shield className="h-7 w-7 text-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
              RescueRadar
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-700 hover:text-orange-500 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Nav Links */}
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.id === "home" ? "/" : `#${link.id}`}
                  className="block text-gray-700 hover:text-orange-500 font-medium transition-colors py-2 border-b border-gray-100 last:border-b-0"
                  onClick={(e) => handleNavClick(e, link.id)}
                >
                  {link.label}
                </a>
              ))}
              
              {/* Mobile Action Buttons */}
              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                  onClick={() => {
                    closeMenu();
                    router.push("/reports-map");
                  }}
                >
                  📍 View Reports Map
                </button>
                <button
                  type="button"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                  onClick={() => {
                    closeMenu();
                    router.push("/report");
                  }}
                >
                  🚨 Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={closeMenu}
        />
      )}
    </>
  );
}
