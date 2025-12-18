// src/app/components/products/product-form/product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  product: Partial<Product> = {
    name: '',
    description: '',
    short_description: '',
    price: 0,
    compare_price: 0,
    cost: 0,
    sku: '',
    barcode: '',
    quantity: 0,
    is_active: true,
    is_featured: false,
    category_id: 0,
    images: []
  };
  
  categories: Category[] = [];
  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  isEditMode = false;
  isLoading = false;
  productId?: number;
  
  variantAttributes: {name: string, values: string}[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.productId = +id;
        this.loadProduct(this.productId);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories = categories,
      error: (error) => console.error('Error loading categories', error)
    });
  }

  loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product = product;
        if (product.images && Array.isArray(product.images)) {
          this.imagePreviews = product.images
            .filter(img => img && typeof img === 'string')
            .map(img => img as string);
        }
      },
      error: (error) => console.error('Error loading product', error)
    });
  }

  onImageSelect(event: any): void {
    const files = event.target.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.selectedImages.push(file);
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    if (index < this.selectedImages.length) {
      this.selectedImages.splice(index, 1);
    }
    if (index < this.imagePreviews.length) {
      this.imagePreviews.splice(index, 1);
    }
  }

  addVariantAttribute(): void {
    this.variantAttributes.push({name: '', values: ''});
  }

  removeVariantAttribute(index: number): void {
    this.variantAttributes.splice(index, 1);
  }

  onSubmit(): void {
    if (!this.product.name || !this.product.category_id || (this.product.price ?? 0) <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    
    // Append product data
    Object.keys(this.product).forEach(key => {
      const value = this.product[key as keyof Product];
      if (value !== undefined && value !== null) {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach((img, index) => {
            if (typeof img === 'string') {
              formData.append(`existing_images[${index}]`, img);
            }
          });
        } else if (key === 'specifications' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    this.selectedImages.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    
    this.variantAttributes.forEach((attr, index) => {
      if (attr.name.trim()) {
        const values = attr.values.split(',').map(v => v.trim()).filter(v => v);
        formData.append(`variant_attributes[${index}][name]`, attr.name);
        formData.append(`variant_attributes[${index}][values]`, JSON.stringify(values));
      }
    });

    if (this.isEditMode && this.productId) {
      this.productService.update(this.productId, formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/products']);
        },
        error: (error) => {
          console.error('Error updating product', error);
          this.isLoading = false;
        }
      });
    } else {
      this.productService.create(formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/products']);
        },
        error: (error) => {
          console.error('Error creating product', error);
          this.isLoading = false;
        }
      });
    }
  }
}