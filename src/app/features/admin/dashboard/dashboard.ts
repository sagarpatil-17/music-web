import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  dashboardData = toSignal(this.dashboardService.getAdminDashboard());

  stats = computed(() => {
    const data = this.dashboardData();

    return [
      {
        title: 'Total Songs',
        value: data?.songs ?? 0,
        description: 'Your music library',
        icon: '♫',
        route: '/admin/songs',
      },
      {
        title: 'Total Albums',
        value: data?.albums ?? 0,
        description: 'Your album collection',
        icon: '◉',
        route: '/admin/albums',
      }
    ];
  });

}
