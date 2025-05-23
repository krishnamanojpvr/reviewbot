import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  
  private usernameSubject = new BehaviorSubject<string>('');
  username$ = this.usernameSubject.asObservable();

  constructor() {
    this.checkAuthState();
  }

  checkAuthState() {
    const token = sessionStorage.getItem('access_token');
    const username = sessionStorage.getItem('username') || '';
    this.isLoggedInSubject.next(!!token);
    this.usernameSubject.next(username);
  }

  login(token: string, username: string) {
    sessionStorage.setItem('access_token', token);
    sessionStorage.setItem('username', username);
    this.isLoggedInSubject.next(true);
    this.usernameSubject.next(username);
  }

  getToken(): string {
    return sessionStorage.getItem('access_token') || '';
  }
  getUsername(): string {
    return sessionStorage.getItem('username') || '';
  }
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('access_token');
  }
  logout() {
    sessionStorage.clear();
    this.isLoggedInSubject.next(false);
    this.usernameSubject.next('');
  }
}