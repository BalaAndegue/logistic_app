import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  category: any = {
    name: '',
    description: '',
    parent_id: undefined,
    is_active: true,
    order: 0
  };
  
  categories: Category[] = [];
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isEditMode = false;
  isLoading = false;
  categoryId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.categoryId = +id;
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories = categories,
      error: (error) => console.error('Error loading categories', error)
    });
  }

  loadCategory(id: number): void {
    this.categoryService.getById(id).subscribe({
      next: (category) => {
        this.category = {
          name: category.name,
          description: category.description || '',
          parent_id: category.parent_id,
          is_active: category.is_active,
          order: category.order || 0
        };
        if (category.image && typeof category.image === 'string') {
          this.imagePreview = category.image;
        }
      },
      error: (error) => console.error('Error loading category', error)
    });
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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        this.selectedImage = file;
        
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit(): void {
    if (!this.category.name.trim()) {
      alert('Category name is required');
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    
    Object.keys(this.category).forEach(key => {
      const value = this.category[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.isEditMode && this.categoryId) {
      this.categoryService.update(this.categoryId, formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/categories']);
        },
        error: (error) => {
          console.error('Error updating category', error);
          this.isLoading = false;
        }
      });
    } else {
      this.categoryService.create(formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/categories']);
        },
        error: (error) => {
          console.error('Error creating category', error);
          this.isLoading = false;
        }
      });
    }
  }
}