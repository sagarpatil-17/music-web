
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PlaylistsService, Playlist } from '../../../core/services/playlists.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './playlists.html',
})
export class Playlists implements OnInit {
  private readonly playlistsService = inject(PlaylistsService);
  private readonly alertService = inject(AlertService);

  readonly playlists = signal<Playlist[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly showCreateForm = signal(false);

  name = '';
  description = '';

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.playlistsService.getMyPlaylists().subscribe({
      next: playlists => {
        this.playlists.set(playlists);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load playlists:', error);
        this.errorMessage.set('Unable to load playlists. Please try again.');
        this.loading.set(false);
      },
    });
  }

  createPlaylist(): void {
    const name = this.name.trim();
    const description = this.description.trim();

    if (!name || this.saving()) return;

    this.saving.set(true);

    this.playlistsService.createPlaylist({
      name,
      ...(description ? { description } : {}),
      visibility: 'PRIVATE',
    }).subscribe({
      next: playlist => {
        this.playlists.update(items => [playlist, ...items]);
        this.name = '';
        this.description = '';
        this.showCreateForm.set(false);
        this.saving.set(false);
        void this.alertService.success(
          'Playlist created',
          'Your new playlist is ready.'
        );
      },
      error: error => {
        console.error('Failed to create playlist:', error);
        this.saving.set(false);
        void this.alertService.error(
          'Unable to create playlist',
          'Check the playlist details and try again.'
        );
      },
    });
  }

  deletePlaylist(playlist: Playlist): void {
    void this.alertService.warning(
      'Delete playlist?',
      `Delete "${playlist.name}"? This action cannot be undone.`
    ).then(result => {
      if (!result.isConfirmed) return;

      this.playlistsService.deletePlaylist(playlist.id).subscribe({
        next: () => {
          this.playlists.update(items =>
            items.filter(item => item.id !== playlist.id)
          );
          void this.alertService.success(
            'Playlist deleted',
            'The playlist was deleted successfully.'
          );
        },
        error: error => {
          console.error('Failed to delete playlist:', error);
          void this.alertService.error(
            'Unable to delete playlist',
            'Please try again.'
          );
        },
      });
    });
  }
}
