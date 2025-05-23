// src/app/interceptors/base-url.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  private readonly baseUrl = 'http://localhost:5000';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only prepend if it's a relative URL
    if (!req.url.startsWith('http')) {
      const apiReq = req.clone({ url: this.baseUrl + req.url });
      return next.handle(apiReq);
    }
    return next.handle(req);
  }
}
