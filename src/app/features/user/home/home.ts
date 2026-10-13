
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../admin/songs/songs.service';
import { Song } from '../../admin/songs/songs.model';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Subject, startWith, tap, switchMap, catchError, of } from 'rxjs';
import { MusicPlayerService } from '../../../core/services/music-player.service';
import { LikesService } from '../../../core/services/likes.service';
import { PlaylistsService, Playlist } from '../../../core/services/playlists.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly songService = inject(SongService);
  readonly player = inject(MusicPlayerService);
  private readonly likesService = inject(LikesService);
  private readonly playlistsService = inject(PlaylistsService);
  private readonly alertService = inject(AlertService);

  readonly likedSongIds = signal<Set<string>>(new Set());
  readonly likingSongIds = signal<Set<string>>(new Set());
  readonly playlists = signal<Playlist[]>([]);
  readonly selectedSongForPlaylist = signal<Song | null>(null);
  readonly playlistsLoading = signal(false);
  readonly addingToPlaylist = signal(false);

  // 1. Writable signal for the template's search bar binding
  searchTerm = signal('');

  // 2. State management variables
  loading = signal(false);
  errorMessage = signal('');

  // 3. RxJS Subject to trigger the search stream safely on click
  private searchAction$ = new Subject<string>();

  ngOnInit(): void {
    this.loadLikedSongIds();
  }

  // 4. Transform the action stream into a read-only Signal of songs
  readonly songs = toSignal(
    this.searchAction$.pipe(
      startWith(''), // Fetch initial songs on component boot
      tap(() => {
        this.loading.set(true);
        this.errorMessage.set('');
      }),
      switchMap((term) =>
        this.songService.getPublishedSongs(term).pipe(
          tap(() => this.loading.set(false)),
          catchError((error) => {
            console.error('Failed to load songs:', error);
            this.errorMessage.set('Unable to load music. Please try again.');
            this.loading.set(false);
            return of([]); // Return an empty array on error to keep stream alive
          })
        )
      )
    ),
    { initialValue: [] as Song[] }
  );

  // Executed on initial explore button or search form submit
  loadSongs(): void {
    this.searchAction$.next(this.searchTerm());
  }

  search(): void {
    this.loadSongs();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.loadSongs();
  }

  playSong(song: Song): void {
    void this.player.playSong(song, this.songs());
  }

  loadLikedSongIds(): void {
    this.likesService.getLikedSongs().subscribe({
      next: songs => {
        this.likedSongIds.set(new Set(songs.map(song => song.id)));
      },
      error: error => {
        console.error('Unable to load liked song IDs:', error);
      },
    });
  }

  isLiked(songId: string): boolean {
    return this.likedSongIds().has(songId);
  }

  toggleLike(song: Song): void {
    if (this.likingSongIds().has(song.id)) return;

    this.likingSongIds.update(ids => new Set(ids).add(song.id));

    const alreadyLiked = this.isLiked(song.id);
    const request$ = alreadyLiked
      ? this.likesService.unlikeSong(song.id)
      : this.likesService.likeSong(song.id);

    request$.subscribe({
      next: () => {
        this.likedSongIds.update(ids => {
          const next = new Set(ids);

          if (alreadyLiked) {
            next.delete(song.id);
          } else {
            next.add(song.id);
          }

          return next;
        });

        this.likingSongIds.update(ids => {
          const next = new Set(ids);
          next.delete(song.id);
          return next;
        });
      },
      error: error => {
        console.error('Unable to update liked song:', error);

        this.likingSongIds.update(ids => {
          const next = new Set(ids);
          next.delete(song.id);
          return next;
        });
      },
    });
  }

openPlaylistPicker(song: Song): void {
  this.selectedSongForPlaylist.set(song);
  this.playlistsLoading.set(true);

  this.playlistsService.getMyPlaylists().subscribe({
    next: (playlists) => {
      this.playlists.set(playlists);
      this.playlistsLoading.set(false);
    },
    error: (error) => {
      console.error('Failed to load playlists:', error);
      this.playlistsLoading.set(false);
      void this.alertService.error(
        'Unable to load playlists',
        'Please try again.'
      );
    },
  });
}

closePlaylistPicker(): void {
  this.selectedSongForPlaylist.set(null);
}

addSongToPlaylist(playlist: Playlist): void {
  const song = this.selectedSongForPlaylist();

  if (!song || this.addingToPlaylist()) return;

  this.addingToPlaylist.set(true);

  this.playlistsService.addSong(playlist.id, song.id).subscribe({
    next: () => {
      this.addingToPlaylist.set(false);
      this.closePlaylistPicker();

      void this.alertService.success(
        'Song added',
        `"${song.title}" was added to "${playlist.name}".`
      );
    },
    error: (error) => {
      console.error('Failed to add song to playlist:', error);
      this.addingToPlaylist.set(false);

      void this.alertService.error(
        'Unable to add song',
        'It may already be in this playlist. Please try again.'
      );
    },
  });
}

}
