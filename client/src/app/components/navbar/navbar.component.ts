import {
  Component,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isLoggedIn$;
  username$;
  mobileMenuOpen = false;
  userDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.username$ = this.authService.username$;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.userDropdownOpen = false;
    this.mobileMenuOpen = false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.userDropdownOpen = false;
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
    if (this.userDropdownOpen) {
      this.mobileMenuOpen = false;
      document.body.classList.remove('mobile-menu-open');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Only for desktop user dropdown!
    if (this.userDropdownOpen) {
      const dropdown = this.elementRef.nativeElement.querySelector('.relative.group');
      if (dropdown && !dropdown.contains(event.target)) {
        this.userDropdownOpen = false;
      }
    }
    // Optionally: close mobile menu if click outside (not required here)
    if (this.mobileMenuOpen) {
      const mobileMenu = this.elementRef.nativeElement.querySelector('.mobile-menu');
      if (mobileMenu && !mobileMenu.contains(event.target)) {
        this.mobileMenuOpen = false;
        document.body.classList.remove('mobile-menu-open');
      }
    }
  }
}