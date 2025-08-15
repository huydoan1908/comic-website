"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/Button";
import { BookOpen, Search, User } from "lucide-react";
import SearchBar from "./SearchBar";

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [isSearchOpen, setSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-gray-700" />
            <span className="text-xl font-bold text-gray-900">ComicHub</span>
          </Link>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="hidden md:flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            )}
            <Button className="rounded-4xl h-auto px-2 aspect-1/1" variant="outline" size="sm" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </Button>
            <SearchBar isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  );
}
