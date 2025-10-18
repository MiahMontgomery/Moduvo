import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed top-0 w-full bg-moduvo-ivory/95 backdrop-blur-sm border-b border-gray-100 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="text-2xl font-bold text-moduvo-charcoal cursor-pointer">
                Moduvo
              </div>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className={`transition-colors duration-200 font-medium ${
                isActive('/') 
                  ? 'text-moduvo-gold' 
                  : 'text-moduvo-charcoal hover:text-moduvo-gold'
              }`}>
                Home
              </Link>
              <Link href="/gallery" className={`transition-colors duration-200 font-medium ${
                isActive('/gallery') 
                  ? 'text-moduvo-gold' 
                  : 'text-moduvo-charcoal hover:text-moduvo-gold'
              }`}>
                Gallery
              </Link>
              <Link href="/customize" className={`transition-colors duration-200 font-medium ${
                isActive('/customize') 
                  ? 'text-moduvo-gold' 
                  : 'text-moduvo-charcoal hover:text-moduvo-gold'
              }`}>
                Design & AR
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/account" className={`transition-colors duration-200 font-medium ${
                    isActive('/account') 
                      ? 'text-moduvo-gold' 
                      : 'text-moduvo-charcoal hover:text-moduvo-gold'
                  }`}>
                    Account
                  </Link>
                  {user && (user as any)?.email === 'admin@example.com' && (
                    <Link href="/admin" className={`transition-colors duration-200 font-medium ${
                      isActive('/admin') 
                        ? 'text-moduvo-gold' 
                        : 'text-moduvo-charcoal hover:text-moduvo-gold'
                    }`}>
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-moduvo-gray">
                  {(user as any)?.firstName || (user as any)?.email}
                </span>
                <Button
                  onClick={() => logout.mutate()}
                  variant="outline"
                  className="border-moduvo-gold text-moduvo-gold hover:bg-moduvo-gold hover:text-white"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => window.location.href = '/api/login'}
                className="bg-moduvo-gold text-white hover:bg-moduvo-gold-light"
              >
                Sign In
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-moduvo-ivory border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-moduvo-charcoal hover:text-moduvo-gold transition-colors duration-200">
              Home
            </Link>
            <Link href="/gallery" className="block px-3 py-2 text-moduvo-charcoal hover:text-moduvo-gold transition-colors duration-200">
              Gallery
            </Link>
            <Link href="/customize" className="block px-3 py-2 text-moduvo-charcoal hover:text-moduvo-gold transition-colors duration-200">
              Design & AR
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/account" className="block px-3 py-2 text-moduvo-charcoal hover:text-moduvo-gold transition-colors duration-200">
                  Account
                </Link>
                {user && (user as any)?.email === 'admin@example.com' && (
                  <Link href="/admin" className="block px-3 py-2 text-moduvo-charcoal hover:text-moduvo-gold transition-colors duration-200">
                    Admin
                  </Link>
                )}
              </>
            )}
            <div className="px-3 py-2">
              {isAuthenticated ? (
                <Button
                  onClick={() => logout.mutate()}
                  variant="outline"
                  size="sm"
                  className="w-full border-moduvo-gold text-moduvo-gold hover:bg-moduvo-gold hover:text-white"
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  onClick={() => window.location.href = '/api/login'}
                  size="sm"
                  className="w-full bg-moduvo-gold text-white hover:bg-moduvo-gold-light"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
