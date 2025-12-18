import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product, ProductFilters, ProductStats } from '../../../models/product.model';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  filters: ProductFilters = {};
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  perPage = 20;
  isVendorView = false;
  showFilters = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}
  stats: ProductStats | undefined;
  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories', error);
        this.error = 'Failed to load categories';
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    
    console.log('Loading products with filters:', this.filters);
    
    this.productService.getAll(this.filters).subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.error = 'Error loading products';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  resetFilters(): void {
    this.filters = {};
    this.loadProducts();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.filters).some(key => {
      const value = this.filters[key as keyof ProductFilters];
      return value !== undefined && value !== null && value !== '';
    });
  }

  countActiveFilters(): number {
    return Object.keys(this.filters).filter(key => {
      const value = this.filters[key as keyof ProductFilters];
      return value !== undefined && value !== null && value !== '';
    }).length;
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.products = this.products.filter(product => product.id !== id);
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product');
        }
      });
    }
  }

  toggleActive(product: Product): void {
    const formData = new FormData();
    formData.append('is_active', (!product.is_active).toString());
    formData.append('_method', 'PUT');
    
    if (product.id) {
      this.productService.update(product.id, formData).subscribe({
        next: () => {
          product.is_active = !product.is_active;
        },
        error: (error) => {
          console.error('Error updating product status:', error);
        }
      });
    }
  }

  exportProducts(): void {
    console.log('Export products functionality to be implemented');
  }

  getProductImage(product: Product): string {
    if (product.image) {
      return product.image;
    }
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
    }
    return 'assets/images/placeholder-product.jpg';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-product.jpg';
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  getPaginationPages(): number[] {
    const pages = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  calculateDiscount(price: number | string, comparePrice?: number): number {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (!comparePrice || comparePrice <= priceNum) return 0;
    return Math.round(((comparePrice - priceNum) / comparePrice) * 100);
  }

  // Méthode pour obtenir la quantité
  getQuantity(product: Product): number {
    return product.stock || 0;
  }

  // Méthode pour obtenir le prix formaté
  getPrice(product: Product): number {
    return typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  }

  // Méthode pour vérifier si le produit est en stock
  isInStock(product: Product): boolean {
    return (product.stock || product.quantity || 0) > 0;
  }


   loadStats(): void {
    this.productService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }
}