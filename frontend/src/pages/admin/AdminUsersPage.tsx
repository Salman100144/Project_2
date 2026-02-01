/**
 * Admin Users Page
 * User management for administrators
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminStore } from '@/stores/admin.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  Trash2,
  Eye,
  X,
  User,
  Mail,
  Calendar,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    users,
    usersTotal,
    usersPage,
    usersPages,
    usersLoading,
    usersError,
    userFilters,
    selectedUser,
    selectedUserLoading,
    fetchUsers,
    fetchUserById,
    updateUserRole,
    deleteUser,
    clearSelectedUser,
  } = useAdminStore();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Initialize filters from URL params
  useEffect(() => {
    const filters = {
      search: searchParams.get('search') || undefined,
      role: (searchParams.get('role') as 'customer' | 'admin') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: 20,
      sortBy: userFilters.sortBy,
      order: userFilters.order,
    };
    fetchUsers(filters);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleRoleFilter = (role: 'customer' | 'admin' | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (role) {
      params.set('role', role);
    } else {
      params.delete('role');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const handleViewUser = async (userId: string) => {
    try {
      await fetchUserById(userId);
      setShowUserModal(true);
    } catch (error) {
      console.error('Failed to fetch user details');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'customer' | 'admin') => {
    setActionLoading(userId);
    const success = await updateUserRole(userId, newRole);
    setActionLoading(null);
    if (!success) {
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(userId);
    const success = await deleteUser(userId);
    setActionLoading(null);
    setDeleteConfirm(null);
    if (!success) {
      alert('Failed to delete user. Users with orders cannot be deleted.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const currentRole = searchParams.get('role');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage customer and admin accounts</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Role Filter */}
            <div className="flex gap-2">
              <Button
                variant={!currentRole ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRoleFilter(undefined)}
              >
                All
              </Button>
              <Button
                variant={currentRole === 'customer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRoleFilter('customer')}
              >
                Customers
              </Button>
              <Button
                variant={currentRole === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRoleFilter('admin')}
              >
                Admins
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({usersTotal})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : usersError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-destructive">{usersError}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Users className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">User</th>
                      <th className="text-left py-3 px-4 font-medium">Role</th>
                      <th className="text-left py-3 px-4 font-medium">Orders</th>
                      <th className="text-left py-3 px-4 font-medium">Spent</th>
                      <th className="text-left py-3 px-4 font-medium">Joined</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                              {user.image ? (
                                <img
                                  src={user.image}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            )}
                          >
                            {user.role === 'admin' ? (
                              <Shield className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">{user.orderCount || 0}</td>
                        <td className="py-3 px-4">{formatCurrency(user.totalSpent || 0)}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewUser(user._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.role === 'customer' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRoleChange(user._id, 'admin')}
                                disabled={actionLoading === user._id}
                                title="Make Admin"
                              >
                                {actionLoading === user._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Shield className="h-4 w-4 text-purple-600" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRoleChange(user._id, 'customer')}
                                disabled={actionLoading === user._id}
                                title="Remove Admin"
                              >
                                {actionLoading === user._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ShieldOff className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            )}
                            {deleteConfirm === user._id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user._id)}
                                  disabled={actionLoading === user._id}
                                >
                                  {actionLoading === user._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Confirm'
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirm(user._id)}
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Page {usersPage} of {usersPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(usersPage - 1)}
                      disabled={usersPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(usersPage + 1)}
                      disabled={usersPage >= usersPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">User Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowUserModal(false);
                  clearSelectedUser();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {selectedUserLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedUser ? (
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    {selectedUser.image ? (
                      <img
                        src={selectedUser.image}
                        alt={selectedUser.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {selectedUser.email}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                          selectedUser.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {selectedUser.role === 'admin' ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {selectedUser.role}
                      </span>
                      {selectedUser.emailVerified && (
                        <span className="text-xs text-green-600">✓ Verified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-sm">Orders</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedUser.orderCount || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Total Spent</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedUser.totalSpent || 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Joined</span>
                    </div>
                    <p className="text-lg font-bold">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>

                {/* Recent Orders */}
                {selectedUser.orders && selectedUser.orders.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recent Orders</h4>
                    <div className="space-y-2">
                      {selectedUser.orders.slice(0, 5).map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              Order #{order._id.slice(-8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(order.totalPrice)}</p>
                            <p className="text-xs capitalize text-muted-foreground">
                              {order.orderStatus}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">User not found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
