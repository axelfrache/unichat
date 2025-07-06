import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PocketbaseApiService, Category, ListResponse } from '../../services/pocketbase-api.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-new-post',
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
              <div class="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                {{ getUserInitials() }}
              </div>
            </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>{{ currentUser?.username }}</a></li>
              <li><a (click)="logout()">Déconnexion</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Créer un nouveau post
            </h2>

            <form (ngSubmit)="onSubmit()" #postForm="ngForm">
              <!-- Title -->
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text font-medium">Titre du post</span>
                  <span class="label-text-alt text-error">*</span>
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="postData.title"
                  name="title"
                  placeholder="Donnez un titre accrocheur à votre post..." 
                  class="input input-bordered w-full" 
                  required
                  minlength="5"
                  maxlength="200"
                  #titleInput="ngModel"
                />
                <label class="label">
                  <span class="label-text-alt text-error" *ngIf="titleInput.invalid && titleInput.touched">
                    Le titre doit contenir entre 5 et 200 caractères
                  </span>
                  <span class="label-text-alt">{{ postData.title.length }}/200</span>
                </label>
              </div>

              <!-- Category -->
              <div class="form-control w-full mt-4">
                <label class="label">
                  <span class="label-text font-medium">Catégorie</span>
                  <span class="label-text-alt text-error">*</span>
                </label>
                <select 
                  [(ngModel)]="postData.category"
                  name="category"
                  class="select select-bordered w-full" 
                  required
                  #categoryInput="ngModel"
                >
                  <option value="" disabled>Choisissez une catégorie</option>
                  <option *ngFor="let category of categories" [value]="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <label class="label">
                  <span class="label-text-alt text-error" *ngIf="categoryInput.invalid && categoryInput.touched">
                    Veuillez sélectionner une catégorie
                  </span>
                  <span class="label-text-alt">
                    <a [routerLink]="['/forum/categories']" class="link link-primary">
                      Gérer les catégories
                    </a>
                  </span>
                </label>
              </div>

              <!-- Content -->
              <div class="form-control w-full mt-4">
                <label class="label">
                  <span class="label-text font-medium">Contenu</span>
                  <span class="label-text-alt text-error">*</span>
                </label>
                <textarea 
                  [(ngModel)]="postData.content"
                  name="content"
                  class="textarea textarea-bordered h-40" 
                  placeholder="Écrivez le contenu de votre post ici...

💡 Quelques conseils :
• Soyez clair et précis
• Utilisez des paragraphes pour aérer votre texte
• N'hésitez pas à poser des questions
• Respectez les autres utilisateurs"
                  required
                  minlength="10"
                  maxlength="5000"
                  #contentInput="ngModel"
                ></textarea>
                <label class="label">
                  <span class="label-text-alt text-error" *ngIf="contentInput.invalid && contentInput.touched">
                    Le contenu doit contenir entre 10 et 5000 caractères
                  </span>
                  <span class="label-text-alt">{{ postData.content.length }}/5000</span>
                </label>
              </div>

              <!-- Preview -->
              <div *ngIf="showPreview && postData.title && postData.content" class="mt-6">
                <div class="divider">Aperçu</div>
                <div class="card bg-base-200 shadow-sm">
                  <div class="card-body">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex-1">
                        <h3 class="text-lg font-bold">{{ postData.title }}</h3>
                        <div class="flex items-center gap-4 text-sm text-base-content/70 mt-2">
                          <div class="flex items-center gap-2">
                            <div class="avatar">
                              <div class="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                                {{ getUserInitials() }}
                              </div>
                            </div>
                            <span class="font-medium">{{ currentUser?.username }}</span>
                          </div>
                          <span>À l'instant</span>
                        </div>
                      </div>
                      <div *ngIf="selectedCategory" class="badge badge-primary">
                        {{ selectedCategory.name }}
                      </div>
                    </div>
                    <div class="prose max-w-none">
                      <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ postData.content }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div *ngIf="errorMessage" class="alert alert-error mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ errorMessage }}</span>
              </div>

              <!-- Actions -->
              <div class="card-actions justify-between mt-8">
                <div class="flex gap-2">
                  <button 
                    type="button" 
                    class="btn btn-outline btn-sm"
                    (click)="togglePreview()"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {{ getPreviewButtonText() }}
                  </button>
                  
                  <button 
                    type="button" 
                    class="btn btn-ghost btn-sm"
                    (click)="saveDraft()"
                    [disabled]="!postData.title && !postData.content"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Sauvegarder le brouillon
                  </button>
                </div>

                <div class="flex gap-2">
                  <button 
                    type="button" 
                    class="btn btn-ghost"
                    [routerLink]="['/forum']"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="postForm.invalid || isSubmitting"
                  >
                    <span *ngIf="isSubmitting" class="loading loading-spinner loading-sm"></span>
                    {{ isSubmitting ? 'Publication...' : 'Publier le post' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Loading Categories -->
        <div *ngIf="isLoadingCategories" class="alert alert-info mt-4">
          <span class="loading loading-spinner loading-sm"></span>
          <span>Chargement des catégories...</span>
        </div>

        <!-- No Categories -->
        <div *ngIf="!isLoadingCategories && categories.length === 0" class="alert alert-warning mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 class="font-bold">Aucune catégorie disponible</h3>
            <div class="text-xs">Vous devez créer au moins une catégorie avant de pouvoir publier un post.</div>
          </div>
          <button class="btn btn-sm btn-primary" [routerLink]="['/forum/categories']">
            Créer une catégorie
          </button>
        </div>
      </div>
    </div>
  `
})
export class NewPostComponent implements OnInit {
  postData = {
    title: '',
    content: '',
    category: ''
  };

  categories: Category[] = [];
  showPreview = false;
  isSubmitting = false;
  isLoadingCategories = true;
  errorMessage = '';
  currentUser: any = null;

  constructor(
    private pocketbaseApi: PocketbaseApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUser;
    this.loadDraft();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.pocketbaseApi.getCategories().subscribe({
      next: (response) => {
        this.categories = response.items;
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
        this.isLoadingCategories = false;
      }
    });
  }

  get selectedCategory(): Category | undefined {
    return this.categories.find(cat => cat.id === this.postData.category);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  getPreviewButtonText(): string {
    return this.showPreview ? 'Masquer l\'aperçu' : 'Voir l\'aperçu';
  }

  saveDraft(): void {
    localStorage.setItem('newPostDraft', JSON.stringify(this.postData));
    // Could show a toast notification here
  }

  loadDraft(): void {
    const draft = localStorage.getItem('newPostDraft');
    if (draft) {
      try {
        this.postData = JSON.parse(draft);
      } catch (error) {
        console.error('Erreur lors du chargement du brouillon:', error);
      }
    }
  }

  clearDraft(): void {
    localStorage.removeItem('newPostDraft');
  }

  onSubmit(): void {
    if (!this.currentUser) {
      this.errorMessage = 'Vous devez être connecté pour publier un post';
      return;
    }

    if (!this.postData.title.trim() || !this.postData.content.trim() || !this.postData.category) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const post = {
      title: this.postData.title.trim(),
      content: this.postData.content.trim(),
      category: this.postData.category,
      author: this.currentUser.id
    };

    this.pocketbaseApi.createPost(post).subscribe({
      next: (createdPost) => {
        this.clearDraft();
        this.router.navigate(['/forum/post', createdPost.id]);
      },
      error: (error) => {
        console.error('Erreur lors de la création du post:', error);
        this.errorMessage = 'Erreur lors de la publication du post. Veuillez réessayer.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  getUserInitials(): string {
    if (!this.currentUser?.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
