import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoaderComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  onSubmit() {
    // Basic validation

    if (!this.username || !this.password || !this.confirmPassword) {
      this.error = 'All fields are required';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.error = '';
    this.loading = true;

    const registerData = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>('/api/register', registerData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Registration successful! Redirecting to login...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.error = response.message || 'Registration failed';
          }
          this.loading = false;
        },
        error: (err) => {
          if (err.error?.detail === '409: Username already exists') {
            this.error = 'This Username is already registered';
          } else {
            this.error = err.error?.message ||
              err.error?.detail ||
              'Registration failed. Please try again.';
          }
          this.loading = false;
        }
      });
  }
}