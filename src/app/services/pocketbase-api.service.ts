import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  created: string;
  updated: string;
}

export interface Category {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  created?: string;
  updated?: string;
}

export interface Post {
  id?: string;
  title: string;
  content: string;
  author: string;
  category: string;
  created?: string;
  updated?: string;
  expand?: {
    author?: User;
    category?: Category;
  };
}

export interface Comment {
  id?: string;
  content: string;
  author: string;
  post: string;
  created?: string;
  updated?: string;
  expand?: {
    author?: User;
  };
}

export interface AuthResponse {
  token: string;
  record: User;
}

export interface ListResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

@Injectable({
  providedIn: 'root'
})
export class PocketbaseApiService {
  private baseUrl = 'http://localhost:8090';

  constructor(private http: HttpClient) {}

  // Auth methods
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/collections/users/auth-with-password`, {
      identity: email,
      password: password
    });
  }

  register(email: string, password: string, passwordConfirm: string, username: string, name?: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/api/collections/users/records`, {
      email,
      password,
      passwordConfirm,
      username,
      name
    });
  }

  // Categories methods
  getCategories(): Observable<ListResponse<Category>> {
    return this.http.get<ListResponse<Category>>(`${this.baseUrl}/api/collections/categories/records`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/api/collections/categories/records`, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.baseUrl}/api/collections/categories/records/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/collections/categories/records/${id}`);
  }

  // Posts methods
  getPosts(page: number = 1, perPage: number = 20, categoryFilter?: string): Observable<ListResponse<Post>> {
    let url = `${this.baseUrl}/api/collections/posts/records?page=${page}&perPage=${perPage}&expand=author,category&sort=-created`;
    if (categoryFilter) {
      url += `&filter=(category='${categoryFilter}')`;
    }
    return this.http.get<ListResponse<Post>>(url);
  }

  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/api/collections/posts/records/${id}?expand=author,category`);
  }

  createPost(post: Omit<Post, 'id' | 'created' | 'updated'>): Observable<Post> {
    return this.http.post<Post>(`${this.baseUrl}/api/collections/posts/records`, post);
  }

  updatePost(id: string, post: Partial<Post>): Observable<Post> {
    return this.http.patch<Post>(`${this.baseUrl}/api/collections/posts/records/${id}`, post);
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/collections/posts/records/${id}`);
  }

  // Comments methods
  getComments(postId: string): Observable<ListResponse<Comment>> {
    return this.http.get<ListResponse<Comment>>(
      `${this.baseUrl}/api/collections/comments/records?filter=(post='${postId}')&expand=author&sort=created`
    );
  }

  createComment(comment: Omit<Comment, 'id' | 'created' | 'updated'>): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/api/collections/comments/records`, comment);
  }

  updateComment(id: string, comment: Partial<Comment>): Observable<Comment> {
    return this.http.patch<Comment>(`${this.baseUrl}/api/collections/comments/records/${id}`, comment);
  }

  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/collections/comments/records/${id}`);
  }
}
