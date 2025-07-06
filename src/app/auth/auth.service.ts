import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PocketbaseApiService, User, AuthResponse } from '../services/pocketbase-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(private pocketbaseApi: PocketbaseApiService) {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        this.tokenSubject.next(token);
        this.currentUserSubject.next(JSON.parse(user));
        this.isLoggedIn$.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.pocketbaseApi.login(email, password).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.record));
        this.tokenSubject.next(response.token);
        this.currentUserSubject.next(response.record);
        this.isLoggedIn$.next(true);
      })
    );
  }

  register(email: string, password: string, passwordConfirm: string, username: string, name?: string): Observable<User> {
    return this.pocketbaseApi.register(email, password, passwordConfirm, username, name);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isLoggedIn$.next(false);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.isLoggedIn$.value;
  }
}
