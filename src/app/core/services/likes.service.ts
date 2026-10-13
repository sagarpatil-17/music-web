
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Song } from '../models/song.model';


type LikedSongItem = Song | { song: Song };

@Injectable({ providedIn: 'root' })
export class LikesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getLikedSongs(): Observable<Song[]> {
    return this.http.get<LikedSongItem[]>(
      `${this.apiUrl}/likes`
    ).pipe(
      map(items =>
        items.map(item => 'song' in item ? item.song : item)
      )
    );
  }

  likeSong(songId: string): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/likes/${songId}`,
      {}
    );
  }

  unlikeSong(songId: string): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/likes/${songId}`
    );
  }
}
