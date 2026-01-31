import { useProductStore } from '@/stores/product.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  className?: string;
}

export function ProductFilters({ className }: ProductFiltersProps) {
  const {
    categories,
    selectedCategory,
    searchQuery,
    sortBy,
    sortOrder,
    isLoadingCategories,
    fetchCategories,
    fetchProducts,
    fetchProductsByCategory,
    searchProducts,
    setSelectedCategory,
    setSearchQuery,
    setSorting,
    clearFilters,
  } = useProductStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      searchProducts(localSearchQuery.trim());
    } else {
      fetchProducts();
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      fetchProductsByCategory(category);
    } else {
      fetchProducts();
    }
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSorting(newSortBy, sortOrder);
    // Refetch with new sorting
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else if (searchQuery) {
      searchProducts(searchQuery);
    } else {
      fetchProducts();
    }
  };

  const handleOrderChange = (newOrder: 'asc' | 'desc') => {
    setSorting(sortBy, newOrder);
    // Refetch with new order
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else if (searchQuery) {
      searchProducts(searchQuery);
    } else {
      fetchProducts();
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setLocalSearchQuery('');
    fetchProducts();
  };

  const hasActiveFilters = selectedCategory || searchQuery || sortBy;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </form>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => handleCategoryChange(null)}
              >
                All
              </Button>
              {isLoadingCategories ? (
                <span className="text-sm text-muted-foreground">Loading...</span>
              ) : (
                categories.map((category) => (
                  <Button
                    key={category.slug}
                    size="sm"
                    variant={selectedCategory === category.slug ? 'default' : 'outline'}
                    onClick={() => handleCategoryChange(category.slug)}
                  >
                    {category.name}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Sorting */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: undefined, label: 'Default' },
                  { value: 'price' as const, label: 'Price' },
                  { value: 'rating' as const, label: 'Rating' },
                  { value: 'title' as const, label: 'Name' },
                ].map((option) => (
                  <Button
                    key={option.label}
                    size="sm"
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Order</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  onClick={() => handleOrderChange('asc')}
                  disabled={!sortBy}
                >
                  Ascending
                </Button>
                <Button
                  size="sm"
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  onClick={() => handleOrderChange('desc')}
                  disabled={!sortBy}
                >
                  Descending
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-sm">
              Search: "{searchQuery}"
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-sm">
              Category: {selectedCategory}
            </span>
          )}
          {sortBy && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-sm">
              Sort: {sortBy} ({sortOrder})
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProductFilters;
