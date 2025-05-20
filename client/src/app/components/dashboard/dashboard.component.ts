import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  products: any[] = [];
  loading = true;
  error = '';
  username = 'User';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.username$.subscribe(name => {
      this.username = name;
    });
    this.fetchMySearches();
  }

  fetchMySearches() {
    this.loading = true;
    this.http.get<any>('http://localhost:5000/api/mysearches',
      { headers: { Authorization: `Bearer ${this.authService.getToken()}` } }
    )
      .subscribe({
        next: (response) => {
          this.products = response.products || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load your searches. Please try again later.';
          this.loading = false;
          console.error('Error fetching searches:', err);
        }
      });
  }

  trackByProductId(index: number, product: any): string {
    return product.product_id;
  }
}