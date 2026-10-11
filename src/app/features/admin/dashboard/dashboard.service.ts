
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface AdminDashboardData {
    songs: number;
    albums: number;
    // add other fields if your API returns more
}

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getAdminDashboard(): Observable<AdminDashboardData> {
        return this.http.get<AdminDashboardData>(
            `${this.baseUrl}/dashboard/admin`
        );
    }
}
