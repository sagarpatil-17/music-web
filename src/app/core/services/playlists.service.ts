
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Song } from '../../features/admin/songs/songs.model';

export interface PlaylistSongItem {
  song: Song;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  visibility?: 'PUBLIC' | 'PRIVATE';
  createdAt?: string;
  updatedAt?: string;
  songs?: PlaylistSongItem[];
}

export interface CreatePlaylistPayload {
  name: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
}

@Injectable({ providedIn: 'root' })
export class PlaylistsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMyPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(
      `${this.apiUrl}/playlists/my`
    );
  }

  getPlaylist(id: string): Observable<Playlist> {
    return this.http.get<Playlist>(
      `${this.apiUrl}/playlists/${id}`
    );
  }

  createPlaylist(payload: CreatePlaylistPayload): Observable<Playlist> {
    return this.http.post<Playlist>(
      `${this.apiUrl}/playlists`,
      payload
    );
  }

  addSong(playlistId: string, songId: string): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/playlists/${playlistId}/songs`,
      { songId }
    );
  }

  removeSong(playlistId: string, songId: string): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/playlists/${playlistId}/songs/${songId}`
    );
  }

  deletePlaylist(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/playlists/${id}`);
  }
}
