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
    <>
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <BookOpen className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-foreground tracking-tight">ComicHub</span>
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
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            )}
            <Button className="rounded-full h-10 w-10 p-0" variant="outline" size="sm" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
    <SearchBar isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
