import { useProductStore } from '@/stores/product.store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductPaginationProps {
  className?: string;
}

export function ProductPagination({ className }: ProductPaginationProps) {
  const {
    total,
    limit,
    currentPage,
    selectedCategory,
    searchQuery,
    setPage,
    fetchProducts,
    fetchProductsByCategory,
    searchProducts,
  } = useProductStore();

  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    setPage(page);
    const skip = (page - 1) * limit;
    
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory, { skip });
    } else if (searchQuery) {
      searchProducts(searchQuery, { skip });
    } else {
      fetchProducts({ skip });
    }
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getVisiblePages().map((page, index) => (
        typeof page === 'number' ? (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ) : (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
            {page}
          </span>
        )
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <span className="text-sm text-muted-foreground ml-4">
        Page {currentPage} of {totalPages} ({total} products)
      </span>
    </div>
  );
}

export default ProductPagination;
