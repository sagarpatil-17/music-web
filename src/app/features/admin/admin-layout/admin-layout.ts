import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.scss',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private router = inject(Router);
  sidebarOpen = false;

  menuItems = [
    { label: 'Dashboard', icon: 'grid', route: '/admin' },
    { label: 'Songs', icon: 'music', route: '/admin/songs' },
    { label: 'Albums', icon: 'disc', route: '/admin/albums' },
    { label: 'Logout', icon: 'logout' },
  ];

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    this.sidebarOpen = false;
    this.router.navigateByUrl('/login');
  }
}
