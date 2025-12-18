import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductVariant } from '../../../models/product-variant.model';

@Component({
  selector: 'app-variant-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './variant-form.component.html',
  styleUrls: ['./variant-form.component.scss']
})
export class VariantFormComponent implements OnInit {
  @Input() productId!: number;
  @Input() variant?: ProductVariant;
  @Input() availableAttributes: Record<string, string[]> = {};
  @Output() saved = new EventEmitter<ProductVariant>();
  @Output() cancelled = new EventEmitter<void>();

  newVariant: Partial<ProductVariant> = {
    product_id: 0,
    sku: '',
    name: '',
    price: 0,
    compare_price: 0,
    cost: 0,
    quantity: 0,
    is_active: true,
    attributes: {}
  };
  
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isEditMode = false;
  selectedAttributes: {[key: string]: string} = {};

  ngOnInit(): void {
    if (this.variant) {
      this.isEditMode = true;
      this.newVariant = { ...this.variant };
      this.selectedAttributes = { ...this.variant.attributes };
      if (this.variant.image && typeof this.variant.image === 'string') {
        this.imagePreview = this.variant.image;
      }
    } else {
      this.newVariant.product_id = this.productId;
    }
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  updateAttributes(): void {
    // Generate variant name based on selected attributes
    const attributeNames = Object.values(this.selectedAttributes);
    if (attributeNames.length > 0) {
      this.newVariant.name = attributeNames.join(' / ');
    }
    
    // Generate SKU based on attributes
    const skuParts = Object.entries(this.selectedAttributes).map(([key, value]) => 
      `${key.substring(0, 3).toUpperCase()}_${value.substring(0, 3).toUpperCase()}`
    );
    if (skuParts.length > 0 && !this.isEditMode) {
      this.newVariant.sku = skuParts.join('-');
    }
  }

  save(): void {
    // Combine selected attributes into the variant object
    this.newVariant.attributes = { ...this.selectedAttributes };
    
    // Emit the saved variant
    this.saved.emit(this.newVariant as ProductVariant);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}