import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore, useCartCount } from '@/stores/cart.store';
import { useWishlistStore, useWishlistCount } from '@/stores/wishlist.store';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  LogOut, 
  User, 
  Home, 
  Package,
  ShoppingCart,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { user, logout, isLoading } = useAuthStore();
  const location = useLocation();
  
  // Cart and Wishlist
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  // Fetch cart and wishlist on mount
  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">E-Commerce</span>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to || 
                  (link.to !== '/' && location.pathname.startsWith(link.to));
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {link.badge > 99 ? '99+' : link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.name || user?.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 py-2 flex items-center justify-around">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to || 
              (link.to !== '/' && location.pathname.startsWith(link.to));
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2026 E-Commerce Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
