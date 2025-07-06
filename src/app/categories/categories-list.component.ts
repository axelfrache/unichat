import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PocketbaseApiService, Category, ListResponse } from '../services/pocketbase-api.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-base-200">
      <!-- Navigation -->
      <div class="navbar bg-base-100 shadow-lg">
        <div class="navbar-start">
          <button class="btn btn-ghost" [routerLink]="['/forum']">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour au forum
          </button>
        </div>
        <div class="navbar-center">
          <a class="btn btn-ghost text-xl font-bold">UniChat</a>
        </div>
        <div class="navbar-end">
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="w-10 h-10 rounded-full bg-primary text-primary-content font-semibold text-sm" style="display: flex; align-items: center; justify-content: center; line-height: 1;">
                {{ getUserInitials() }}
              </div>
            </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>{{ currentUser?.email }}</a></li>
              <li><a (click)="logout()">Déconnexion</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 class="text-3xl font-bold">Gestion des catégories</h1>
            <p class="text-base-content/70 mt-1">Organisez les discussions par thématiques</p>
          </div>
          <button 
            class="btn btn-primary"
            (click)="openCreateModal()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle catégorie
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- Categories Grid -->
        <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let category of categories; trackBy: trackByCategoryId" 
               class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div class="card-body">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h2 class="card-title">
                    {{ category.name }}
                  </h2>
                  <p class="text-base-content/70 text-sm mt-2" *ngIf="category.description">
                    {{ category.description }}
                  </p>
                  <div class="text-xs text-base-content/50 mt-2">
                    Créée {{ formatDate(category.created) }}
                  </div>
                </div>
                
                <div class="dropdown dropdown-end">
                  <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                    </svg>
                  </div>
                  <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                    <li><a (click)="editCategory(category)">Modifier</a></li>
                    <li><a (click)="deleteCategory(category.id!)" class="text-error">Supprimer</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="categories.length === 0" class="col-span-full text-center py-12">
            <div class="text-6xl mb-4">📁</div>
            <h3 class="text-xl font-bold mb-2">Aucune catégorie</h3>
            <p class="text-base-content/70 mb-4">
              Créez votre première catégorie pour organiser les discussions.
            </p>
            <button 
              class="btn btn-primary"
              (click)="openCreateModal()"
            >
              Créer une catégorie
            </button>
          </div>
        </div>

        <!-- Create/Edit Modal -->
        <div class="modal" [class.modal-open]="showModal">
          <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">
              {{ editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
            </h3>
            
            <form (ngSubmit)="onSubmit()" #categoryForm="ngForm">
              <!-- Name -->
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Nom de la catégorie</span>
                  <span class="label-text-alt text-error">*</span>
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="categoryData.name"
                  name="name"
                  class="input input-bordered w-full" 
                  required
                  minlength="2"
                  maxlength="50"
                  #nameInput="ngModel"
                />
                <label class="label">
                  <span class="label-text-alt text-error" *ngIf="nameInput.invalid && nameInput.touched">
                    Le nom doit contenir entre 2 et 50 caractères
                  </span>
                  <span class="label-text-alt">{{ categoryData.name.length }}/50</span>
                </label>
              </div>

              <!-- Description -->
              <div class="form-control w-full mt-4">
                <label class="label">
                  <span class="label-text">Description (optionnelle)</span>
                </label>
                <textarea 
                  [(ngModel)]="categoryData.description"
                  name="description"
                  class="textarea textarea-bordered h-20" 
                  maxlength="200"
                ></textarea>
                <label class="label">
                  <span class="label-text-alt">{{ (categoryData.description || '').length }}/200</span>
                </label>
              </div>

              <!-- Error Message -->
              <div *ngIf="errorMessage" class="alert alert-error mt-4">
                <span>{{ errorMessage }}</span>
              </div>

              <div class="modal-action">
                <button 
                  type="button" 
                  class="btn btn-ghost"
                  (click)="closeModal()"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [disabled]="categoryForm.invalid || isSubmitting"
                >
                  <span *ngIf="isSubmitting" class="loading loading-spinner loading-sm"></span>
                  {{ isSubmitting ? 'Sauvegarde...' : (editingCategory ? 'Modifier' : 'Créer') }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="modal" [class.modal-open]="showDeleteModal">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Supprimer la catégorie</h3>
            <p class="py-4">
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
            </p>
            <div class="modal-action">
              <button class="btn btn-ghost" (click)="cancelDelete()">Annuler</button>
              <button 
                class="btn btn-error" 
                (click)="confirmDelete()"
                [disabled]="isDeleting"
              >
                <span *ngIf="isDeleting" class="loading loading-spinner loading-sm"></span>
                {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoriesListComponent implements OnInit {
  categories: Category[] = [];
  showModal = false;
  showDeleteModal = false;
  editingCategory: Category | null = null;
  deletingCategoryId: string | null = null;
  isLoading = true;
  isSubmitting = false;
  isDeleting = false;
  errorMessage = '';
  currentUser: any = null;

  categoryData = {
    name: '',
    description: ''
  };

  constructor(
    private pocketbaseApi: PocketbaseApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.pocketbaseApi.getCategories().subscribe({
      next: (response) => {
        this.categories = response.items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingCategory = null;
    this.categoryData = {
      name: '',
      description: ''
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryData = {
      name: category.name,
      description: category.description || ''
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.categoryData.name.trim()) {
      this.errorMessage = 'Le nom de la catégorie est obligatoire';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const categoryPayload = {
      name: this.categoryData.name.trim(),
      description: this.categoryData.description.trim() || undefined
    };

    const operation = this.editingCategory
      ? this.pocketbaseApi.updateCategory(this.editingCategory.id!, categoryPayload)
      : this.pocketbaseApi.createCategory(categoryPayload);

    operation.subscribe({
      next: () => {
        this.closeModal();
        this.loadCategories();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.errorMessage = 'Erreur lors de la sauvegarde. Veuillez réessayer.';
        this.isSubmitting = false;
      }
    });
  }

  deleteCategory(categoryId: string): void {
    this.deletingCategoryId = categoryId;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deletingCategoryId = null;
  }

  confirmDelete(): void {
    if (!this.deletingCategoryId) return;

    this.isDeleting = true;
    this.pocketbaseApi.deleteCategory(this.deletingCategoryId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.deletingCategoryId = null;
        this.loadCategories();
        this.isDeleting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.isDeleting = false;
        // Could show error in modal or toast
      }
    });
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.id!;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  }

  getUserInitials(): string {
    if (!this.currentUser?.email) return 'U';
    return this.currentUser.email.charAt(0).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
