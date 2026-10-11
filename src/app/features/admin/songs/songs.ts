
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, of, switchMap } from 'rxjs';

import { AlertService } from '../../../core/services/alert.service';
import { Album } from '../../../core/models/album.model';
import { Song, UpdateSongPayload, CreateSongPayload } from './songs.model';
import { SongService } from './songs.service';

@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './songs.html',
  styleUrl: './songs.scss',
})
export class Songs implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly songService = inject(SongService);
  private readonly alert = inject(AlertService);

  // Signal-based component state
  readonly songs = signal<Song[]>([]);
  readonly albums = signal<Album[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploading = signal(false);

  readonly editingSong = signal<Song | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly searchTerm = signal('');
  readonly formVisible = signal(false);

  // Derived state
  readonly songCount = computed(() => this.songs().length);

  readonly isEditing = computed(() => this.editingSong() !== null);

  readonly allowedExtensions = [
    '.mp3',
    '.wav',
    '.m4a',
    '.aac',
    '.ogg',
    '.flac',
  ];

  readonly maxFileSize = 50 * 1024 * 1024;

  readonly songForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    artists: ['', Validators.required],
    albumId: [''],
  });

  ngOnInit(): void {
    this.loadSongs();
  }

  loadSongs(): void {
    this.loading.set(true);

    this.songService
      .getAdminSongs(this.searchTerm())
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (songs) => {
          this.songs.set(songs);
        },
        error: (error: unknown) => {
          console.error('Failed to load songs:', error);

          void this.alert.error(
            'Could not load songs',
            'Please check your connection and try again.',
          );
        },
      });
  }

  searchSongs(value: string): void {
    this.searchTerm.set(value);
    this.loadSongs();
  }

  openCreateForm(): void {
    this.editingSong.set(null);
    this.selectedFile.set(null);

    this.songForm.reset({
      title: '',
      description: '',
      artists: '',
      albumId: '',
    });

    this.formVisible.set(true);
    this.loadAlbums();
  }

  openEditForm(song: Song): void {
    this.editingSong.set(song);
    this.selectedFile.set(null);

    this.songForm.reset({
      title: song.title,
      description: song.description ?? '',
      artists: song.artists.join(', '),
      albumId: song.albumId ?? '',
    });

    this.formVisible.set(true);
    this.loadAlbums();
  }

  cancelForm(): void {
    this.formVisible.set(false);
    this.editingSong.set(null);
    this.selectedFile.set(null);
    this.songForm.reset({
      title: '',
      description: '',
      artists: '',
      albumId: '',
    });
  }

  loadAlbums(): void {
    this.songService.getAlbums().subscribe({
      next: (albums) => {
        this.albums.set(albums);
      },
      error: (error: unknown) => {
        console.error('Failed to load albums:', error);

        void this.alert.error(
          'Could not load albums',
          'Please check your connection and try again.',
        );
      },
    });
  }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile.set(null);

    if (!file) {
      return;
    }

    const extension = file.name
      .slice(file.name.lastIndexOf('.'))
      .toLowerCase();

    if (
      !file.type.startsWith('audio/') ||
      !this.allowedExtensions.includes(extension)
    ) {
      void this.alert.error(
        'Unsupported audio file',
        'Choose an MP3, WAV, M4A, AAC, OGG, or FLAC file.',
      );

      input.value = '';
      return;
    }

    if (file.size > this.maxFileSize) {
      void this.alert.error(
        'File is too large',
        'Audio files must be 50 MB or smaller.',
      );

      input.value = '';
      return;
    }

    this.selectedFile.set(file);
  }

  saveSong(): void {
    if (this.songForm.invalid || this.saving()) {
      this.songForm.markAllAsTouched();

      if (!this.editingSong() && !this.selectedFile()) {
        void this.alert.warning(
          'Audio file required',
          'Select an audio file before creating a song.',
        );
      }

      return;
    }

    const editingSong = this.editingSong();
    const selectedFile = this.selectedFile();

    if (!editingSong && !selectedFile) {
      void this.alert.warning(
        'Audio file required',
        'Select an audio file before creating a song.',
      );
      return;
    }

    this.saving.set(true);

    const formValue = this.songForm.getRawValue();

    const commonPayload = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      artists: formValue.artists
        .split(',')
        .map((artist) => artist.trim())
        .filter(Boolean),
      ...(formValue.albumId.trim()
        ? { albumId: formValue.albumId.trim() }
        : {}),
    };

    if (commonPayload.artists.length === 0) {
      this.saving.set(false);

      void this.alert.warning(
        'Artist required',
        'Enter at least one artist name.',
      );
      return;
    }

    const upload$ = selectedFile
      ? this.songService.uploadAudio(selectedFile)
      : of({
          audioPath: editingSong?.audioPath ?? '',
        });

    this.uploading.set(!!selectedFile);

    upload$
      .pipe(
        switchMap((upload) => {
          this.uploading.set(false);

          if (editingSong) {
            const payload: UpdateSongPayload = {
              ...commonPayload,
            };

            return this.songService.updateSong(editingSong.id, payload);
          }

          const payload: CreateSongPayload = {
            ...commonPayload,
            audioPath: upload.audioPath,
          };

          return this.songService.createSong(payload);
        }),
        finalize(() => {
          this.saving.set(false);
          this.uploading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          const wasEditing = !!editingSong;

          this.cancelForm();
          this.loadSongs();

          void this.alert.success(
            wasEditing ? 'Song updated' : 'Song created',
            wasEditing
              ? 'The song details have been updated.'
              : 'The song has been saved as a draft.',
          );
        },
        error: (error: unknown) => {
          console.error('Failed to save song:', error);

          void this.alert.error(
            'Could not save song',
            this.getErrorMessage(error),
          );
        },
      });
  }

  togglePublish(song: Song): void {
    const publish = song.status !== 'PUBLISHED';

    void this.alert
      .warning(
        publish ? 'Publish this song?' : 'Unpublish this song?',
        publish
          ? `"${song.title}" will become available to users.`
          : `"${song.title}" will no longer appear in the public catalogue.`,
      )
      .then((result) => {
        if (!result.isConfirmed) {
          return;
        }

        const request$ = publish
          ? this.songService.publishSong(song.id)
          : this.songService.unpublishSong(song.id);

        request$.subscribe({
          next: () => {
            void this.alert.success(
              publish ? 'Song published' : 'Song unpublished',
              `"${song.title}" has been updated.`,
            );

            this.loadSongs();
          },
          error: (error: unknown) => {
            console.error('Failed to update song status:', error);

            void this.alert.error(
              'Update failed',
              this.getErrorMessage(error),
            );
          },
        });
      });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  private getErrorMessage(error: unknown): string {
    const response = error as {
      error?: { message?: string | string[] };
      message?: string;
    };

    const message = response?.error?.message ?? response?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message || 'Something went wrong. Please try again.';
  }
}
