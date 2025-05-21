import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { LoaderComponent } from '../loader/loader.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  products: any[] = [];
  loading = true;
  error = '';
  username = 'User';
  dropdownOpen: string | null = null;

  // For custom delete dialog
  deleteDialogOpen: boolean = false;
  deleteTargetProductId: string | null = null;

  searchUrl: string = '';
  searchLoading: boolean = false;

  // For dropdown dismissal
  @ViewChildren('dropdownToggle') dropdownToggles!: QueryList<ElementRef>;
  @ViewChildren('dropdownMenu') dropdownMenus!: QueryList<ElementRef>;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private elementRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.username$.subscribe((name) => {
      this.username = name;
    });
    this.fetchMySearches();
  }

  ngAfterViewInit() {
    // No-op, but required for ViewChildren to work
  }

  fetchMySearches() {
    this.loading = true;
    this.http
      .get<any>('http://localhost:5000/api/mysearches', {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
        },
      })
      .subscribe({
        next: (response) => {
          this.products = response.products || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load your searches. Please try again later.';
          this.loading = false;
          console.error('Error fetching searches:', err);
        },
      });
  }

  searchProduct() {
    if (!this.searchUrl.trim()) return;

    this.searchLoading = true;

    this.http
      .post<any>(
        'http://localhost:5000/api/search',
        { url: this.searchUrl },
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      )
      .subscribe({
        next: (res) => {
          this.searchLoading = false;
          const product_id = res.product_id;
          this.router.navigate(['/product', product_id]);
        },
        error: (err) => {
          this.searchLoading = false;
          alert('Search failed. Please try again.');
          console.error('Search error:', err);
        },
      });
  }

  toggleDropdown(productId: string, event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen = this.dropdownOpen === productId ? null : productId;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.dropdownOpen) return;
    let toggles = this.dropdownToggles.toArray();
    let menus = this.dropdownMenus.toArray();
    let openIndex = this.products.findIndex(
      (p) => p.product_id === this.dropdownOpen
    );

    // Defensive: Ensure index is in bounds
    if (openIndex < 0) {
      this.dropdownOpen = null;
      return;
    }

    const toggleEl = toggles[openIndex]?.nativeElement;
    const menuEl = menus[openIndex]?.nativeElement;

    if (
      (toggleEl && toggleEl.contains(event.target)) ||
      (menuEl && menuEl.contains(event.target))
    ) {
      return;
    }
    this.dropdownOpen = null;
  }

  // Custom Delete Popup Logic
  openDeleteDialog(productId: string) {
    this.deleteDialogOpen = true;
    this.deleteTargetProductId = productId;
    this.dropdownOpen = null; // Close dropdown when opening dialog
  }

  closeDeleteDialog() {
    this.deleteDialogOpen = false;
    this.deleteTargetProductId = null;
  }

  confirmDeleteProduct() {
    if (!this.deleteTargetProductId) return;
    this.loading = true;
    this.http
      .delete('http://localhost:5000/api/delete', {
        body: { product_id: this.deleteTargetProductId },
        headers: { Authorization: `Bearer ${this.authService.getToken()}` },
      })
      .subscribe({
        next: () => {
          this.fetchMySearches();
          this.closeDeleteDialog();
        },
        error: (err) => {
          console.error('Delete failed', err);
          alert('Failed to delete the item. Try again later.');
          this.closeDeleteDialog();
        },
      });
  }

  trackByProductId(index: number, product: any): string {
    return product.product_id;
  }
}