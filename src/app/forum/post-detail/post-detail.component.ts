import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PocketbaseApiService, Post, Comment, ListResponse } from '../../services/pocketbase-api.service';
import { AuthService } from '../../auth/auth.service';

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
        <!-- Loading -->
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- Post Detail -->
        <div *ngIf="!isLoading && post" class="space-y-6">
          <!-- Post Card -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h1 class="text-2xl font-bold mb-2">{{ post.title }}</h1>
                  <div class="flex items-center gap-4 text-sm text-base-content/70">
                    <div class="flex items-center gap-2">
                      <div class="avatar">
                        <div class="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                          {{ getAuthorInitials(post.expand?.author) }}
                        </div>
                      </div>
                      <span class="font-medium">{{ post.expand?.author?.username || 'Utilisateur' }}</span>
                    </div>
                    <span>{{ formatDate(post.created) }}</span>
                  </div>
                </div>
                
                <div class="flex flex-col items-end gap-2">
                  <div *ngIf="post.expand?.category" class="badge badge-primary">
                    {{ post.expand?.category?.name }}
                  </div>
                  <div *ngIf="canEditPost()" class="dropdown dropdown-end">
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
              
              <div class="prose max-w-none">
                <p class="text-base leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title mb-4">
                Commentaires ({{ comments.length }})
              </h2>

              <!-- Add Comment Form -->
              <div class="mb-6">
                <form (ngSubmit)="addComment()" #commentForm="ngForm">
                  <div class="form-control">
                    <textarea 
                      [(ngModel)]="newCommentContent"
                      name="comment"
                      class="textarea textarea-bordered h-24" 
                      placeholder="Écrivez votre commentaire..."
                      required
                      minlength="1"
                    ></textarea>
                  </div>
                  <div class="form-control mt-4">
                    <button 
                      type="submit" 
                      class="btn btn-primary btn-sm w-fit"
                      [disabled]="commentForm.invalid || isAddingComment"
                    >
                      <span *ngIf="isAddingComment" class="loading loading-spinner loading-sm"></span>
                      {{ isAddingComment ? 'Publication...' : 'Publier le commentaire' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Comments List -->
              <div *ngIf="isLoadingComments" class="flex justify-center py-4">
                <span class="loading loading-spinner loading-md"></span>
              </div>

              <div *ngIf="!isLoadingComments" class="space-y-4">
                <div *ngFor="let comment of comments; trackBy: trackByCommentId" 
                     class="border-l-4 border-primary/20 pl-4 py-3 bg-base-200/50 rounded-r-lg">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="avatar">
                        <div class="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                          {{ getAuthorInitials(comment.expand?.author) }}
                        </div>
                      </div>
                      <span class="font-medium text-sm">{{ comment.expand?.author?.username || 'Utilisateur' }}</span>
                      <span class="text-xs text-base-content/50">{{ formatDate(comment.created) }}</span>
                    </div>
                    
                    <div *ngIf="canEditComment(comment)" class="dropdown dropdown-end">
                      <div tabindex="0" role="button" class="btn btn-ghost btn-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                        </svg>
                      </div>
                      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                        <li><a (click)="editComment(comment)" class="text-xs">Modifier</a></li>
                        <li><a (click)="deleteComment(comment.id!)" class="text-xs text-error">Supprimer</a></li>
                      </ul>
                    </div>
                  </div>
                  
                  <div *ngIf="editingCommentId !== comment.id">
                    <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
                  </div>
                  
                  <!-- Edit Comment Form -->
                  <div *ngIf="editingCommentId === comment.id">
                    <form (ngSubmit)="updateComment(comment)" #editForm="ngForm">
                      <div class="form-control">
                        <textarea 
                          [(ngModel)]="editingCommentContent"
                          name="editContent"
                          class="textarea textarea-bordered textarea-sm h-20" 
                          required
                          minlength="1"
                        ></textarea>
                      </div>
                      <div class="flex gap-2 mt-2">
                        <button 
                          type="submit" 
                          class="btn btn-primary btn-xs"
                          [disabled]="editForm.invalid || isUpdatingComment"
                        >
                          Sauvegarder
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-ghost btn-xs"
                          (click)="cancelEditComment()"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <!-- Empty state -->
                <div *ngIf="comments.length === 0" class="text-center py-8">
                  <div class="text-4xl mb-4">💭</div>
                  <p class="text-base-content/70">Aucun commentaire pour le moment.</p>
                  <p class="text-sm text-base-content/50">Soyez le premier à commenter !</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error state -->
        <div *ngIf="!isLoading && !post" class="card bg-base-100 shadow-xl">
          <div class="card-body text-center">
            <h2 class="card-title justify-center text-error">Post non trouvé</h2>
            <p>Ce post n'existe pas ou a été supprimé.</p>
            <div class="card-actions justify-center">
              <button class="btn btn-primary" (click)="goBack()">Retour au forum</button>
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
  
  isLoading = true;
  isLoadingComments = true;
  isAddingComment = false;
  isUpdatingComment = false;
  
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pocketbaseApi: PocketbaseApiService,
    private authService: AuthService
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
      error: (error) => {
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
      error: (error) => {
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
      error: (error) => {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        this.isAddingComment = false;
      }
    });
  }

  editComment(comment: Comment): void {
    this.editingCommentId = comment.id!;
    this.editingCommentContent = comment.content;
  }

  updateComment(comment: Comment): void {
    if (!this.editingCommentContent.trim()) return;

    this.isUpdatingComment = true;
    this.pocketbaseApi.updateComment(comment.id!, { content: this.editingCommentContent.trim() }).subscribe({
      next: () => {
        this.cancelEditComment();
        this.loadComments(this.post!.id!);
        this.isUpdatingComment = false;
      },
      error: (error) => {
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
        error: (error) => {
          console.error('Erreur lors de la suppression du commentaire:', error);
        }
      });
    }
  }

  canEditPost(): boolean {
    return !!(this.currentUser && this.post && this.currentUser.id === this.post.author);
  }

  canEditComment(comment: Comment): boolean {
    return !!(this.currentUser && this.currentUser.id === comment.author);
  }

  editPost(): void {
    // Navigate to edit post (to be implemented)
    console.log('Edit post functionality to be implemented');
  }

  deletePost(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      this.pocketbaseApi.deletePost(this.post!.id!).subscribe({
        next: () => {
          this.router.navigate(['/forum']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du post:', error);
        }
      });
    }
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id!;
  }

  getUserInitials(): string {
    if (!this.currentUser?.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  getAuthorInitials(author: any): string {
    if (!author?.username) return 'U';
    return author.username.substring(0, 2).toUpperCase();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  }

  goBack(): void {
    this.router.navigate(['/forum']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
