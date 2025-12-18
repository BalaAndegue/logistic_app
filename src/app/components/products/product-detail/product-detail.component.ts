// src/app/components/products/product-detail/product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  error: string | null = null;
  selectedImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string): void {
    this.isLoading = true;
    this.productService.getBySlug(slug).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Product not found';
        this.isLoading = false;
        console.error('Error loading product:', error);
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  getMainImage(): string {
    if (!this.product?.images || this.product.images.length === 0) {
      return 'assets/images/placeholder-product.jpg';
    }
    
    const image = this.product.images[this.selectedImageIndex];
    return typeof image === 'string' ? image : URL.createObjectURL(image);
  }

  getThumbnailImage(image: any, index: number): string {
    if (typeof image === 'string') {
      return image;
    } else if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return 'assets/images/placeholder-thumb.jpg';
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
    }
}