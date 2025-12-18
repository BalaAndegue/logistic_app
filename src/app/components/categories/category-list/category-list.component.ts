import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { Category, CategoryTree } from '../../../models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  categoriesTree: CategoryTree[] = [];
  isLoading = true;
  error: string | null = null;
  viewMode: 'table' | 'tree' = 'table';
  expandedNodes: Set<number> = new Set();

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.loadTree();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load categories';
        this.isLoading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  loadTree(): void {
    this.categoryService.getTree().subscribe({
      next: (tree) => {
        this.categoriesTree = tree;
      },
      error: (error) => {
        console.error('Error loading category tree:', error);
      }
    });
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.delete(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(cat => cat.id !== id);
          this.loadTree(); // Recharger l'arborescence
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          alert('Failed to delete category');
        }
      });
    }
  }

  toggleActive(category: Category): void {
    if (category.id) {
      const formData = new FormData();
      formData.append('is_active', (!category.is_active).toString());
      formData.append('_method', 'PUT');
      
      this.categoryService.update(category.id, formData).subscribe({
        next: () => {
          category.is_active = !category.is_active;
        },
        error: (error) => {
          console.error('Error updating category status:', error);
        }
      });
    }
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'table' ? 'tree' : 'table';
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedNodes.has(categoryId);
  }

  toggleNode(category: CategoryTree): void {
    if (category.id) {
      if (this.isExpanded(category.id)) {
        this.expandedNodes.delete(category.id);
      } else {
        this.expandedNodes.add(category.id);
      }
    }
  }

  // Méthode pour gérer les erreurs d'image
  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  // Méthode pour vérifier si une image est une URL valide
  isImageUrl(image: any): boolean {
    return image && typeof image === 'string' && 
           (image.startsWith('http') || image.startsWith('/') || image.startsWith('data:'));
  }

  // Méthode pour obtenir l'URL de l'image
  getImageUrl(image: any): string {
    if (this.isImageUrl(image)) {
      return image;
    }
    return 'assets/images/placeholder-category.jpg';
  }

  // Méthode pour obtenir le nombre d'enfants
  getChildCount(category: CategoryTree): number {
    return category.children?.length || 0;
  }

  // Méthode pour vérifier si une catégorie a des enfants
  hasChildren(category: CategoryTree): boolean {
    return !!category.children && category.children.length > 0;
  }
}