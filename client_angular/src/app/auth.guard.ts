import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean | UrlTree {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      return true;
    }
    return this.router.parseUrl('/login');
  }

  //   canActivate(): boolean | UrlTree {
  //   const token = sessionStorage.getItem('access_token');

  //   if (!token) {
  //     return this.router.parseUrl('/login');
  //   }

  //   // Decode token to check expiry (example using jwt-decode)
  //   const tokenExp = JSON.parse(atob(token.split('.')[1])?.exp;
  //   const isExpired = tokenExp ? (Date.now() >= tokenExp * 1000) : true;

  //   if (isExpired) {
  //     sessionStorage.clear();
  //     return this.router.parseUrl('/login');
  //   }

  //   return true;
  // }
}