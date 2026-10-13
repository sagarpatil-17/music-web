
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  Playlist,
  PlaylistsService,
} from '../../../core/services/playlists.service';
import { SongService } from '../../admin/songs/songs.service';
import { Song } from '../../admin/songs/songs.model';
import { MusicPlayerService } from '../../../core/services/music-player.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-playlist-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './playlist-details.html',
})
export class PlaylistDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly playlistsService = inject(PlaylistsService);
  private readonly songService = inject(SongService);
  private readonly alertService = inject(AlertService);

  readonly player = inject(MusicPlayerService);
  readonly playlist = signal<Playlist | null>(null);
  readonly availableSongs = signal<Song[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly addingSongId = signal<string | null>(null);
  readonly removingSongId = signal<string | null>(null);

  private playlistId = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.playlistId = params.get('id') ?? '';

      if (this.playlistId) {
        this.loadPlaylist();
      } else {
        this.loading.set(false);
        this.errorMessage.set('Invalid playlist.');
      }
    });
  }

  loadPlaylist(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      playlist: this.playlistsService.getPlaylist(this.playlistId),
      songs: this.songService.getPublishedSongs(),
    }).subscribe({
      next: result => {
        this.playlist.set(result.playlist);
        this.availableSongs.set(result.songs);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load playlist:', error);
        this.errorMessage.set(
          'Unable to load this playlist. It may have been deleted or you may not have access.'
        );
        this.loading.set(false);
      },
    });
  }

  playlistSongs(): Song[] {
    return (this.playlist()?.songs ?? [])
      .map(item => item.song)
      .filter(Boolean);
  }

  isSongAdded(songId: string): boolean {
    return this.playlistSongs().some(song => song.id === songId);
  }

  addSong(song: Song): void {
    if (this.addingSongId()) return;

    this.addingSongId.set(song.id);

    this.playlistsService.addSong(this.playlistId, song.id).subscribe({
      next: () => {
        this.addingSongId.set(null);
        this.loadPlaylist();
      },
      error: error => {
        console.error('Failed to add song:', error);
        this.addingSongId.set(null);
        void this.alertService.error(
          'Unable to add song',
          'This song may already be in the playlist. Please refresh and try again.'
        );
      },
    });
  }

  removeSong(song: Song): void {
    if (this.removingSongId()) return;

    this.removingSongId.set(song.id);

    this.playlistsService.removeSong(this.playlistId, song.id).subscribe({
      next: () => {
        const current = this.playlist();

        if (current) {
          this.playlist.set({
            ...current,
            songs: (current.songs ?? []).filter(
              item => item.song.id !== song.id
            ),
          });
        }

        this.removingSongId.set(null);
      },
      error: error => {
        console.error('Failed to remove song:', error);
        this.removingSongId.set(null);
        void this.alertService.error(
          'Unable to remove song',
          'Please try again.'
        );
      },
    });
  }

  playSong(song: Song): void {
    void this.player.playSong(song, this.playlistSongs());
  }

  playAll(): void {
    const songs = this.playlistSongs();

    if (songs.length) {
      void this.player.playSong(songs[0], songs);
    }
  }
}
