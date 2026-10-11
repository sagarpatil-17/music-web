
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
    AudioUploadResponse,
    CreateSongPayload,
    Song,
    UpdateSongPayload,
} from './songs.model';
import { environment } from '../../../../environments/environment';
import { Album } from '../../../core/models/album.model';

@Injectable({
    providedIn: 'root',
})
export class SongService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getAdminSongs(search = ''): Observable<Song[]> {
        let params = new HttpParams();

        if (search.trim()) {
            params = params.set('search', search.trim());
        }

        return this.http.get<Song[]>(
            `${this.baseUrl}/songs/admin/list`,
            { params }
        );
    }

    uploadAudio(file: File): Observable<AudioUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<AudioUploadResponse>(
            `${this.baseUrl}/songs/upload-audio`,
            formData
        );
    }

    createSong(payload: CreateSongPayload): Observable<Song> {
        return this.http.post<Song>(`${this.baseUrl}/songs`, payload);
    }

    updateSong(
        id: string,
        payload: UpdateSongPayload
    ): Observable<Song> {
        return this.http.patch<Song>(
            `${this.baseUrl}/songs/${id}`,
            payload
        );
    }

    publishSong(id: string): Observable<Song> {
        return this.http.patch<Song>(
            `${this.baseUrl}/songs/${id}/publish`,
            {}
        );
    }

    unpublishSong(id: string): Observable<Song> {
        return this.http.patch<Song>(
            `${this.baseUrl}/songs/${id}/unpublish`,
            {}
        );
    }

    getAlbums(): Observable<Album[]> {
        return this.http.get<Album[]>(
            `${this.baseUrl}/albums`
        );
    }
}
