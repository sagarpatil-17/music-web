
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MusicPlayer } from '../music-player/music-player';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MusicPlayer],
  templateUrl: './user-layout.html',
})
export class UserLayout {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly sidebarOpen = signal(false);
  readonly profileMenuOpen = signal(false);

  readonly user = signal(this.authService.getUser());

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(open => !open);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.closeProfileMenu();
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
