import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, LogOut, User } from 'lucide-react';

export function HomePage() {
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">E-Commerce</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.name || user?.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome, {user?.name}! 👋</CardTitle>
            <CardDescription>
              You're successfully logged in to the E-Commerce store.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">Your Account Details</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Email:</dt>
                  <dd>{user?.email}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Role:</dt>
                  <dd className="capitalize">{user?.role || 'customer'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Member since:</dt>
                  <dd>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</dd>
                </div>
              </dl>
            </div>
            
            <p className="text-muted-foreground text-sm">
              🚧 Products, cart, and checkout features coming soon!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default HomePage;
