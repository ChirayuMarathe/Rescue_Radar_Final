"use client";

import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
// Removed custom Button import

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">
              RescueRadar
            </span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a
              href="#home"
              className="text-gray-700 hover:text-orange-500 font-medium"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-orange-500 font-medium"
            >
              About
            </a>
            <a
              href="#report"
              className="text-gray-700 hover:text-orange-500 font-medium"
            >
              Report
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-orange-500 font-medium"
            >
              Contact
            </a>
          </nav>

          <button
            type="button"
            className="hidden md:block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Emergency Report
          </button>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <a
                href="#home"
                className="text-gray-700 hover:text-orange-500 font-medium"
              >
                Home
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-orange-500 font-medium"
              >
                About
              </a>
              <a
                href="#report"
                className="text-gray-700 hover:text-orange-500 font-medium"
              >
                Report
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-orange-500 font-medium"
              >
                Contact
              </a>
              <button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 w-fit text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Emergency Report
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
