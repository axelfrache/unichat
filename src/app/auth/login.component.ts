import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div class="card w-full max-w-sm bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-center text-2xl font-bold mb-6">UniChat</h2>
          
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email"
                placeholder="your.email@university.edu" 
                class="input input-bordered w-full" 
                required
                #emailInput="ngModel"
              />
              <div *ngIf="emailInput.invalid && emailInput.touched" class="label">
                <span class="label-text-alt text-error">Email valide requis</span>
              </div>
            </div>

            <div class="form-control w-full mt-4">
              <label class="label">
                <span class="label-text">Mot de passe</span>
              </label>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password"
                placeholder="••••••••" 
                class="input input-bordered w-full" 
                required
                minlength="6"
                #passwordInput="ngModel"
              />
              <div *ngIf="passwordInput.invalid && passwordInput.touched" class="label">
                <span class="label-text-alt text-error">Mot de passe requis (min. 6 caractères)</span>
              </div>
            </div>

            <div *ngIf="errorMessage" class="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>

            <div class="card-actions justify-end mt-6">
              <button 
                type="submit" 
                class="btn btn-primary w-full"
                [disabled]="loginForm.invalid || isLoading"
              >
                <span *ngIf="isLoading" class="loading loading-spinner loading-sm"></span>
                {{ isLoading ? 'Connexion...' : 'Se connecter' }}
              </button>
            </div>
          </form>

          <div class="divider">OU</div>
          
          <div class="text-center">
            <p class="text-sm">Pas encore de compte ?</p>
            <button 
              type="button"
              class="btn btn-outline btn-sm mt-2"
              (click)="toggleMode()"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>

      <!-- Registration Modal -->
      <div *ngIf="showRegister" class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Créer un compte</h3>
          
          <form (ngSubmit)="onRegister()" #registerForm="ngForm">
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">Nom d'utilisateur</span>
              </label>
              <input 
                type="text" 
                [(ngModel)]="registerData.username" 
                name="username"
                placeholder="john_doe" 
                class="input input-bordered w-full" 
                required
                minlength="3"
              />
            </div>

            <div class="form-control w-full mt-4">
              <label class="label">
                <span class="label-text">Nom complet</span>
              </label>
              <input 
                type="text" 
                [(ngModel)]="registerData.name" 
                name="name"
                placeholder="John Doe" 
                class="input input-bordered w-full"
              />
            </div>

            <div class="form-control w-full mt-4">
              <label class="label">
                <span class="label-text">Email universitaire</span>
              </label>
              <input 
                type="email" 
                [(ngModel)]="registerData.email" 
                name="registerEmail"
                placeholder="john.doe@university.edu" 
                class="input input-bordered w-full" 
                required
              />
            </div>

            <div class="form-control w-full mt-4">
              <label class="label">
                <span class="label-text">Mot de passe</span>
              </label>
              <input 
                type="password" 
                [(ngModel)]="registerData.password" 
                name="registerPassword"
                placeholder="••••••••" 
                class="input input-bordered w-full" 
                required
                minlength="6"
              />
            </div>

            <div class="form-control w-full mt-4">
              <label class="label">
                <span class="label-text">Confirmer le mot de passe</span>
              </label>
              <input 
                type="password" 
                [(ngModel)]="registerData.passwordConfirm" 
                name="passwordConfirm"
                placeholder="••••••••" 
                class="input input-bordered w-full" 
                required
                minlength="6"
              />
            </div>

            <div *ngIf="registerError" class="alert alert-error mt-4">
              <span>{{ registerError }}</span>
            </div>

            <div class="modal-action">
              <button 
                type="button" 
                class="btn btn-ghost"
                (click)="toggleMode()"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="registerForm.invalid || isRegistering"
              >
                <span *ngIf="isRegistering" class="loading loading-spinner loading-sm"></span>
                {{ isRegistering ? 'Création...' : 'Créer le compte' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  
  showRegister = false;
  isRegistering = false;
  registerError = '';
  registerData = {
    username: '',
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.email && this.password) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.router.navigate(['/forum']);
        },
        error: (error) => {
          this.errorMessage = 'Email ou mot de passe incorrect';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  toggleMode(): void {
    this.showRegister = !this.showRegister;
    this.registerError = '';
    this.errorMessage = '';
  }

  onRegister(): void {
    if (this.registerData.password !== this.registerData.passwordConfirm) {
      this.registerError = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isRegistering = true;
    this.registerError = '';

    this.authService.register(
      this.registerData.email,
      this.registerData.password,
      this.registerData.passwordConfirm,
      this.registerData.username,
      this.registerData.name
    ).subscribe({
      next: () => {
        this.showRegister = false;
        this.errorMessage = '';
        // Auto-login after registration
        this.email = this.registerData.email;
        this.password = this.registerData.password;
        this.onSubmit();
      },
      error: (error) => {
        this.registerError = 'Erreur lors de la création du compte';
        this.isRegistering = false;
      },
      complete: () => {
        this.isRegistering = false;
      }
    });
  }
}
