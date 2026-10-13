
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { LikesService } from '../../../core/services/likes.service';
import { MusicPlayerService } from '../../../core/services/music-player.service';
import { AlertService } from '../../../core/services/alert.service';
import { Song } from '../../../core/models/song.model';

@Component({
  selector: 'app-liked-songs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './liked-songs.html',
})
export class LikedSongs implements OnInit {
  private readonly likesService = inject(LikesService);
  private readonly alertService = inject(AlertService);

  readonly player = inject(MusicPlayerService);
  readonly songs = signal<Song[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly removingSongId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadLikedSongs();
  }

  loadLikedSongs(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.likesService.getLikedSongs().subscribe({
      next: songs => {
        this.songs.set(songs);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load liked songs:', error);
        this.errorMessage.set('Unable to load liked songs. Please try again.');
        this.loading.set(false);
      },
    });
  }

  playSong(song: Song): void {
    void this.player.playSong(song, this.songs());
  }

  removeLike(song: Song): void {
    if (this.removingSongId()) return;

    this.removingSongId.set(song.id);

    this.likesService.unlikeSong(song.id).subscribe({
      next: () => {
        this.songs.update(items =>
          items.filter(item => item.id !== song.id)
        );
        this.removingSongId.set(null);
      },
      error: error => {
        console.error('Failed to remove liked song:', error);
        this.removingSongId.set(null);
        void this.alertService.error(
          'Unable to remove song',
          'Please try again.'
        );
      },
    });
  }
}
