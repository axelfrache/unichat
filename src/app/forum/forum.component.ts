import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PocketbaseApiService, Post, Category, ListResponse } from '../services/pocketbase-api.service';
import { AuthService } from '../auth/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-base-200">
      <!-- Navigation -->
      <div class="navbar bg-base-100 shadow-lg">
        <div class="navbar-start">
          <div class="dropdown">
            <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a [routerLink]="['/forum']" routerLinkActive="active">Forum</a></li>
              <li><a [routerLink]="['/forum/categories']" routerLinkActive="active">Catégories</a></li>
            </ul>
          </div>
          <a class="btn btn-ghost text-xl font-bold">UniChat</a>
        </div>
        
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li><a [routerLink]="['/forum']" routerLinkActive="active" class="btn btn-ghost">Forum</a></li>
            <li><a [routerLink]="['/forum/categories']" routerLinkActive="active" class="btn btn-ghost">Catégories</a></li>
          </ul>
        </div>
        
        <div class="navbar-end">
          <!-- Theme Toggle -->
          <button 
            class="btn btn-ghost btn-circle mr-2"
            (click)="toggleTheme()"
            [title]="themeService.isDarkMode() ? 'Passer en mode clair' : 'Passer en mode sombre'"
          >
            @if (themeService.isDarkMode()) {
              <!-- Sun icon for light mode -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            } @else {
              <!-- Moon icon for dark mode -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          </button>
          
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

      <!-- Main Content -->
      <div class="container mx-auto px-4 py-8">
        <!-- Header with actions -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 class="text-3xl font-bold">Forum Universitaire</h1>
            <p class="text-base-content/70 mt-1">Discutez avec vos camarades étudiants</p>
          </div>
          <button 
            class="btn btn-primary"
            [routerLink]="['/forum/new-post']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nouveau post
          </button>
        </div>

        <!-- Filters -->
        <div class="card bg-base-100 shadow-xl mb-6">
          <div class="card-body">
            <div class="flex flex-wrap gap-2 items-center">
              <span class="text-sm font-medium">Filtrer par catégorie:</span>
              <button 
                class="btn btn-sm"
                [class.btn-primary]="!selectedCategory"
                [class.btn-outline]="selectedCategory"
                (click)="filterByCategory(null)"
              >
                Toutes
              </button>
              @for (category of categories; track category.id) {
                <button 
                  class="btn btn-sm"
                  [class.btn-primary]="selectedCategory === category.id"
                  [class.btn-outline]="selectedCategory !== category.id"
                  (click)="filterByCategory(category.id!)"
                >
                  {{ category.name }}
                </button>
              }
            </div>
          </div>
        </div>

        @if (isLoading) {
          <div class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        }

        @if (!isLoading) {
          <div class="space-y-4">
            @for (post of posts; track post.id) {
              <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                   (click)="openPost(post.id!)">
                <div class="card-body">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h2 class="card-title text-lg font-bold hover:text-primary transition-colors">
                        {{ post.title }}
                      </h2>
                      <p class="text-base-content/70 mt-2 line-clamp-2">
                        {{ post.content }}
                      </p>
                    </div>
                    
                    <div class="flex flex-col items-end gap-2 ml-4">
                      @if (post.expand?.category) {
                        <div class="badge badge-primary badge-sm">
                          {{ post.expand?.category?.name }}
                        </div>
                      }
                      <div class="text-xs text-base-content/50">
                        {{ formatDate(post.created) }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center gap-2">
                      <div class="avatar">
                        <div class="w-8 h-8 rounded-full bg-primary text-primary-content font-semibold text-xs" style="display: flex; align-items: center; justify-content: center; line-height: 1;">
                          {{ getAuthorInitials(post.expand?.author) }}
                        </div>
                      </div>
                      <span class="text-sm font-medium">
                        {{ post.expand?.author?.email || 'Utilisateur' }}
                      </span>
                    </div>
                    
                    <div class="flex items-center gap-4 text-sm text-base-content/70">
                      <div class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Voir les commentaires</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (posts.length === 0) {
              <div class="text-center py-12">
                <div class="text-6xl mb-4">💬</div>
                <h3 class="text-xl font-bold mb-2">Aucun post trouvé</h3>
                <p class="text-base-content/70 mb-4">
                  {{ selectedCategory ? 'Aucun post dans cette catégorie.' : 'Soyez le premier à publier !' }}
                </p>
                <button 
                  class="btn btn-primary"
                  [routerLink]="['/forum/new-post']"
                >
                  Créer le premier post
                </button>
              </div>
            }
          </div>
        }

        @if (postsResponse && postsResponse.totalPages > 1) {
          <div class="flex justify-center mt-8">
            <div class="join">
              <button 
                class="join-item btn"
                [disabled]="currentPage === 1"
                (click)="changePage(currentPage - 1)"
              >
                «
              </button>
              @for (page of getPageNumbers(); track page) {
                <button 
                  class="join-item btn"
                  [class.btn-active]="page === currentPage"
                  (click)="changePage(page)"
                >
                  {{ page }}
                </button>
              }
              <button 
                class="join-item btn"
                [disabled]="currentPage === postsResponse.totalPages"
                (click)="changePage(currentPage + 1)"
              >
                »
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ForumComponent implements OnInit {
  posts: Post[] = [];
  categories: Category[] = [];
  selectedCategory: string | null = null;
  currentPage = 1;
  isLoading = true;
  postsResponse: ListResponse<Post> | null = null;
  currentUser: any = null;

  constructor(
    private pocketbaseApi: PocketbaseApiService,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadPosts();
  }

  loadCategories(): void {
    this.pocketbaseApi.getCategories().subscribe({
      next: (response) => {
        this.categories = response.items;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    });
  }

  loadPosts(): void {
    this.isLoading = true;
    this.pocketbaseApi.getPosts(this.currentPage, 20, this.selectedCategory || undefined).subscribe({
      next: (response) => {
        this.postsResponse = response;
        this.posts = response.items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des posts:', error);
        this.isLoading = false;
      }
    });
  }

  filterByCategory(categoryId: string | null): void {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.loadPosts();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadPosts();
  }

  getPageNumbers(): number[] {
    if (!this.postsResponse) return [];
    const total = this.postsResponse.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];
    
    // Simple pagination - show up to 5 pages around current
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  openPost(postId: string): void {
    this.router.navigate(['/forum/post', postId]);
  }

  getUserInitials(): string {
    if (!this.currentUser?.email) return 'U';
    return this.currentUser.email.charAt(0).toUpperCase();
  }

  getAuthorInitials(author: any): string {
    if (!author?.email) return 'U';
    return author.email.charAt(0).toUpperCase();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
