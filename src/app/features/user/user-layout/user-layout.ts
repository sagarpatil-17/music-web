
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './user-layout.html',
})
export class UserLayout {
  sidebarOpen = false;

  constructor(private router: Router) {}

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login');
  }
}
