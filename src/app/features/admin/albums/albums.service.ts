
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Album, AlbumPayload } from '../../../core/models/album.model';
import { environment } from '../../../../environments/environment';


@Injectable({
    providedIn: 'root',
})
export class AlbumService {
    private readonly http = inject(HttpClient);

    // Replace this with your existing API constant if available.
    private readonly apiUrl = environment.apiUrl;

    getAlbums(): Observable<Album[]> {
        return this.http.get<Album[]>(`${this.apiUrl}/albums`);
    }

    getAlbumById(id: string): Observable<Album> {
        return this.http.get<Album>(
            `${this.apiUrl}/albums/${encodeURIComponent(id)}`
        );
    }

    createAlbum(payload: AlbumPayload): Observable<Album> {
        return this.http.post<Album>(`${this.apiUrl}/albums`, payload);
    }

    updateAlbum(
        id: string,
        payload: AlbumPayload
    ): Observable<Album> {
        return this.http.patch<Album>(
            `${this.apiUrl}/albums/${encodeURIComponent(id)}`,
            payload
        );
    }

    archiveAlbum(id: string): Observable<Album> {
        return this.http.delete<Album>(
            `${this.apiUrl}/albums/${encodeURIComponent(id)}`
        );
    }
}
