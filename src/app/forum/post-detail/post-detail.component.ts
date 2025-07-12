import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PocketbaseApiService, Post } from '../../services/pocketbase-api.service';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../services/theme.service';

// Use type-only import to avoid conflict with global Comment type
import type { Comment } from '../../services/pocketbase-api.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-base-200">
      <!-- Navigation -->
      <div class="navbar bg-base-100 shadow-lg">
        <div class="navbar-start">
          <button class="btn btn-ghost" (click)="goBack()">
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
          <!-- Theme Toggle -->
          <button 
            class="btn btn-circle btn-ghost" 
            (click)="toggleTheme()"
            [title]="themeService.isDarkMode() ? 'Passer en mode clair' : 'Passer en mode sombre'"
          >
            @if (themeService.isDarkMode()) {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          </button>

          <div class="dropdown dropdown-end ml-2">
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
        <!-- Loading -->
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- Post Detail -->
        <div *ngIf="!isLoading && post" class="space-y-8">
          <!-- Post Card -->
          <div class="card bg-base-100 shadow-xl overflow-hidden">
            <div class="card-body p-6 md:p-8">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                <div class="flex-1">
                  <h1 *ngIf="!isEditingPost" class="text-2xl font-bold mb-3">{{ post.title }}</h1>
                  <div *ngIf="!isEditingPost" class="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
                    <div class="flex items-center gap-2">
                      <div class="avatar">
                        <div class="w-8 h-8 rounded-full bg-primary text-primary-content font-semibold text-xs" style="display: flex; align-items: center; justify-content: center; line-height: 1;">
                          {{ getAuthorInitials(post.expand?.author) }}
                        </div>
                      </div>
                      <span class="font-medium">{{ post.expand?.author?.email || 'Utilisateur' }}</span>
                    </div>
                    <span>{{ formatDate(post.created) }}</span>
                  </div>
                </div>
                
                <div class="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                  <div *ngIf="post.expand?.category" class="badge badge-primary">
                    {{ post.expand?.category?.name }}
                  </div>
                  <div *ngIf="canEditPost() && !isEditingPost" class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                      </svg>
                    </div>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a (click)="editPost()">Modifier</a></li>
                      <li><a (click)="deletePost()" class="text-error">Supprimer</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <!-- Post Content or Edit Form -->
              <div *ngIf="!isEditingPost" class="prose max-w-none mb-2 px-1">
                <p class="text-base leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
              </div>
              
              <!-- Edit Post Form -->
              <div *ngIf="isEditingPost" class="mt-4">
                <!-- Edit Post Form -->
                <form *ngIf="isEditingPost" (ngSubmit)="updatePost()" #postEditForm="ngForm">
                  <!-- Title -->
                  <div class="form-control w-full">
                    <label class="label">
                      <span class="label-text font-medium">Titre du post</span>
                      <span class="label-text-alt text-error">*</span>
                    </label>
                    <input 
                      type="text" 
                      [(ngModel)]="editingPostTitle"
                      name="title"
                      class="input input-bordered w-full" 
                      required
                      minlength="5"
                      maxlength="200"
                      #titleInput="ngModel"
                    />
                    <label class="label">
                      <span *ngIf="titleInput.invalid && titleInput.touched" class="label-text-alt text-error">
                        Le titre doit contenir au moins 5 caractères
                      </span>
                      <span class="label-text-alt">{{ editingPostTitle.length }}/200</span>
                    </label>
                  </div>

                  <!-- Content -->
                  <div class="form-control w-full mt-6">
                    <label class="label">
                      <span class="label-text font-medium text-lg">Contenu</span>
                      <span class="label-text-alt text-error">*</span>
                    </label>
                    <div class="mt-2">
                      <textarea 
                        [(ngModel)]="editingPostContent"
                        name="content"
                        class="textarea textarea-bordered w-full h-48 resize-none" 
                        required
                        minlength="10"
                        maxlength="5000"
                        #contentInput="ngModel"
                      ></textarea>
                    </div>
                    <label class="label">
                      <span *ngIf="contentInput.invalid && contentInput.touched" class="label-text-alt text-error">
                        Le contenu doit contenir au moins 10 caractères
                      </span>
                      <span class="label-text-alt">{{ editingPostContent.length }}/5000</span>
                    </label>
                  </div>

                  <!-- Actions -->
                  <div class="card-actions justify-end mt-8">
                    <div class="flex gap-2">
                      <button 
                        type="button" 
                        class="btn btn-ghost"
                        (click)="cancelEditPost()"
                        [disabled]="isUpdatingPost"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        class="btn btn-primary"
                        [disabled]="postEditForm.invalid || isUpdatingPost"
                      >
                        <span *ngIf="isUpdatingPost" class="loading loading-spinner loading-sm"></span>
                        {{ isUpdatingPost ? 'Enregistrement...' : 'Enregistrer' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body p-6 md:p-8">
              <h2 class="card-title text-xl mb-6 pb-2 border-b border-base-200">
                Commentaires ({{ comments.length }})
              </h2>

              <!-- Add Comment Form -->
              <div class="mb-8">
                <form (ngSubmit)="addComment()" #commentForm="ngForm">
                  <div class="form-control w-full">
                    <label class="label">
                      <span class="label-text font-medium">Ajouter un commentaire</span>
                    </label>
                    <textarea 
                      [(ngModel)]="newCommentContent"
                      name="comment"
                      class="textarea textarea-bordered h-28 w-full" 
                      placeholder="Rédigez votre commentaire ici..."
                      required
                      minlength="1"
                    ></textarea>
                  </div>
                  <div class="form-control mt-3 flex justify-end">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      [disabled]="commentForm.invalid || isAddingComment"
                    >
                      <span *ngIf="isAddingComment" class="loading loading-spinner loading-sm"></span>
                      {{ isAddingComment ? 'Publication...' : 'Publier le commentaire' }}
                    </button>
                  </div>
                </form>
              </div>
              
              <div class="divider my-0"></div>

              <!-- Comments List -->
              <div *ngIf="isLoadingComments" class="flex justify-center py-4">
                <span class="loading loading-spinner loading-md"></span>
              </div>

              <div *ngIf="!isLoadingComments" class="space-y-6 mt-4">
                <div *ngFor="let comment of comments; trackBy: trackByCommentId" 
                     class="border-l-4 border-primary/30 pl-5 py-4 bg-base-200/40 rounded-r-lg shadow-sm hover:shadow transition-shadow">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center flex-wrap gap-2 mb-3">
                      <div class="avatar">
                        <div class="w-7 h-7 rounded-full bg-primary text-primary-content font-semibold text-xs" style="display: flex; align-items: center; justify-content: center; line-height: 1;">
                          {{ getAuthorInitials(comment.expand?.author) }}
                        </div>
                      </div>
                      <span class="font-medium text-sm">{{ comment.expand?.author?.email || 'Utilisateur' }}</span>
                      <span class="text-xs text-base-content/50">{{ formatDate(comment.created) }}</span>
                    </div>
                    
                    <div *ngIf="canDeleteComment(comment)" class="dropdown dropdown-end">
                      <div tabindex="0" role="button" class="btn btn-ghost btn-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                        </svg>
                      </div>
                      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                        <li *ngIf="isCommentAuthor(comment)"><a (click)="editComment(comment)" class="text-xs">Modifier</a></li>
                        <li><a (click)="deleteComment(comment.id!)" class="text-xs text-error">Supprimer</a></li>
                      </ul>
                    </div>
                  </div>
                  
                  <div *ngIf="editingCommentId !== comment.id" class="px-1">
                    <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
                  </div>
                  
                  <!-- Edit Comment Form -->
                  <div *ngIf="editingCommentId === comment.id" class="mt-2">
                    <form (ngSubmit)="updateComment(comment)" #editForm="ngForm">
                      <div class="form-control mb-3">
                        <textarea 
                          [(ngModel)]="editingCommentContent"
                          name="editContent"
                          class="textarea textarea-bordered h-24 w-full" 
                          required
                          minlength="1"
                        ></textarea>
                      </div>
                      <div class="flex justify-end gap-3">
                        <button 
                          type="button" 
                          class="btn btn-outline btn-sm"
                          (click)="cancelEditComment()"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          class="btn btn-primary btn-sm"
                          [disabled]="editForm.invalid || isUpdatingComment"
                        >
                          <span *ngIf="isUpdatingComment" class="loading loading-spinner loading-xs"></span>
                          {{ isUpdatingComment ? 'Enregistrement...' : 'Sauvegarder' }}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <!-- Empty state -->
                <div *ngIf="comments.length === 0" class="text-center py-12 bg-base-200/30 rounded-xl">
                  <div class="text-5xl mb-4 opacity-80">💭</div>
                  <h3 class="text-lg font-medium mb-2">Aucun commentaire pour le moment</h3>
                  <p class="text-base-content/70 max-w-md mx-auto">Soyez le premier à commenter ce post et lancez la discussion !</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error state -->
        <div *ngIf="!isLoading && !post" class="card bg-base-100 shadow-xl">
          <div class="card-body p-12 text-center">
            <div class="mb-6 text-5xl opacity-70">🔍</div>
            <h2 class="card-title justify-center text-error text-2xl mb-4">Post non trouvé</h2>
            <p class="mb-6 text-base-content/70">Ce post n'existe pas ou a été supprimé.</p>
            <div class="card-actions justify-center">
              <button class="btn btn-primary btn-wide" (click)="goBack()">Retour au forum</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  newCommentContent = '';
  editingCommentId: string | null = null;
  editingCommentContent = '';
  
  isEditingPost = false;
  editingPostTitle = '';
  editingPostContent = '';
  
  isLoading = true;
  isLoadingComments = true;
  isAddingComment = false;
  isUpdatingComment = false;
  isUpdatingPost = false;
  
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pocketbaseApi: PocketbaseApiService,
    private authService: AuthService,
    public themeService: ThemeService
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    const postId = this.route.snapshot.params['id'];
    if (postId) {
      this.loadPost(postId);
      this.loadComments(postId);
    }
  }

  loadPost(id: string): void {
    this.pocketbaseApi.getPost(id).subscribe({
      next: (post) => {
        this.post = post;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement du post:', error);
        this.isLoading = false;
      }
    });
  }

  loadComments(postId: string): void {
    this.isLoadingComments = true;
    this.pocketbaseApi.getComments(postId).subscribe({
      next: (response) => {
        this.comments = response.items;
        this.isLoadingComments = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des commentaires:', error);
        this.isLoadingComments = false;
      }
    });
  }

  addComment(): void {
    if (!this.newCommentContent.trim() || !this.post || !this.currentUser) return;

    this.isAddingComment = true;
    const comment = {
      content: this.newCommentContent.trim(),
      author: this.currentUser.id,
      post: this.post.id!
    };

    this.pocketbaseApi.createComment(comment).subscribe({
      next: () => {
        this.newCommentContent = '';
        this.loadComments(this.post!.id!);
        this.isAddingComment = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        this.isAddingComment = false;
      }
    });
  }

  editComment(comment: Comment): void {
    this.editingCommentId = comment.id!;
    this.editingCommentContent = comment.content!;
  }

  updateComment(comment: Comment): void {
    if (!this.editingCommentContent.trim()) return;

    this.isUpdatingComment = true;
    const updatedComment = {
      content: this.editingCommentContent.trim()
    };

    this.pocketbaseApi.updateComment(comment.id!, updatedComment).subscribe({
      next: () => {
        this.loadComments(this.post!.id!);
        this.editingCommentId = null;
        this.editingCommentContent = '';
        this.isUpdatingComment = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la mise à jour du commentaire:', error);
        this.isUpdatingComment = false;
      }
    });
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editingCommentContent = '';
  }

  deleteComment(commentId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      this.pocketbaseApi.deleteComment(commentId).subscribe({
        next: () => {
          this.loadComments(this.post!.id!);
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression du commentaire:', error);
        }
      });
    }
  }

  canEditPost(): boolean {
    return !!(this.currentUser && this.post && this.currentUser.id === this.post.author);
  }

  canDeleteComment(comment: Comment): boolean {
    return this.isCommentAuthor(comment) || this.isPostAuthor();
  }

  isCommentAuthor(comment: Comment): boolean {
    return !!(this.currentUser && comment.author && this.currentUser.id === comment.author);
  }

  isPostAuthor(): boolean {
    return !!(this.currentUser && this.post && this.currentUser.id === this.post.author);
  }

  editPost(): void {
    this.editingPostTitle = this.post?.title || '';
    this.editingPostContent = this.post?.content || '';
    this.isEditingPost = true;
  }

  cancelEditPost(): void {
    this.isEditingPost = false;
    this.editingPostTitle = '';
    this.editingPostContent = '';
  }

  updatePost(): void {
    if (!this.post || !this.editingPostTitle.trim() || !this.editingPostContent.trim()) return;

    this.isUpdatingPost = true;
    // Store expand data to preserve it after update
    const expandData = {
      author: this.post.expand?.author,
      category: this.post.expand?.category
    };

    const updatedPost = {
      title: this.editingPostTitle.trim(),
      content: this.editingPostContent.trim()
    };

    this.pocketbaseApi.updatePost(this.post.id!, updatedPost).subscribe({
      next: (post) => {
        // Restore expand data to avoid UI bugs where author was shown as "Utilisateur"
        post.expand = expandData;
        this.post = post;
        this.isEditingPost = false;
        this.isUpdatingPost = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la mise à jour du post:', error);
        this.isUpdatingPost = false;
      }
    });
  }

  deletePost(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      this.pocketbaseApi.deletePost(this.post!.id!).subscribe({
        next: () => {
          this.goBack();
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression du post:', error);
        }
      });
    }
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id!;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    
    const postDate = new Date(date);
    const now = new Date();
    
    // Si la date est aujourd'hui, afficher l'heure
    if (postDate.toDateString() === now.toDateString()) {
      return `Aujourd'hui à ${postDate.getHours().toString().padStart(2, '0')}:${postDate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Si la date est hier
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (postDate.toDateString() === yesterday.toDateString()) {
      return `Hier à ${postDate.getHours().toString().padStart(2, '0')}:${postDate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Sinon afficher la date complète
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short',
      year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('fr-FR', options).format(postDate);
  }

  getUserInitials(): string {
    if (!this.currentUser || !this.currentUser.email) return '?';
    
    const email = this.currentUser.email as string;
    const name = email.split('@')[0];
    
    if (name.includes('.')) {
      const names = name.split('.');
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    
    return name.charAt(0).toUpperCase();
  }

  getAuthorInitials(author: any): string {
    if (!author || !author.email) return '?';
    
    const email = author.email as string;
    const name = email.split('@')[0];
    
    if (name.includes('.')) {
      const names = name.split('.');
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    
    return name.charAt(0).toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/forum']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
