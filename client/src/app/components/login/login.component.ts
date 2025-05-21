import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../../components/loader/loader.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin() {
    if (!this.username || !this.password) return;

    this.loading = true;

    this.http.post('/api/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        this.authService.login(response.access_token, response.username);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // alert('Login failed. Check your credentials.');
        this.error = 'Login failed. Check your credentials.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}