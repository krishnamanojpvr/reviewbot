import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthGuard } from './auth.guard';
import { BaseUrlInterceptor } from './baseurlinterceptor.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const interceptor = new BaseUrlInterceptor();
          return interceptor.intercept(req, {
            handle: next
          });
        }
      ])
    ),
    AuthGuard

  ]
};