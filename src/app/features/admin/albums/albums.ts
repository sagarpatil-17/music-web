import { Component, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { Album, AlbumPayload } from '../../../core/models/album.model';
import { AlbumService } from './albums.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-albums',
  styleUrl: './albums.scss',
  templateUrl: './albums.html',
})
export class Albums {
  private readonly albumService = inject(AlbumService);

  // Core UI State Signals
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  showForm = signal(false);
  isEditMode = signal(false);
  selectedAlbumId = signal<string | null>(null);
  archivingId = signal<string | null>(null);

  searchTerm = signal('');
  form = signal<AlbumPayload>(this.emptyForm());

  // FIXED: Changed to a standard Writable Signal with an empty array fallback
  readonly albums = signal<Album[]>([]);

  readonly albumTypes: string[] = [];

  // FIXED: 'list' is now 100% guaranteed by TypeScript to be an array, never undefined
  readonly filteredAlbums = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.albums(); // Always returns Album[]

    if (!term) return list;

    return list.filter((album) => {
      const title = album.title?.toLowerCase() ?? '';
      const description = album.description?.toLowerCase() ?? '';
      return title.includes(term) || description.includes(term);
    });
  });

  ngOnInit(): void {
    this.refreshAlbums(); // Initial load when component starts
  }

  private emptyForm(): AlbumPayload {
    return { title: '', description: '' };
  }

  // FIXED: Simple, clean data fetching method that sets the writable signal value
  refreshAlbums(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.albumService
      .getAlbums()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.albums.set(data ?? []); // Safely populates the signal array
        },
        error: (error: unknown) => {
          console.error('Failed to load albums:', error);
          this.errorMessage.set('Unable to load albums.');
          this.albums.set([]); // Reset to clean state on error
        },
      });
  }

  updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  openCreateForm(): void {
    this.isEditMode.set(false);
    this.selectedAlbumId.set(null);
    this.form.set(this.emptyForm());
    this.showForm.set(true);
  }

  openEditForm(album: Album): void {
    this.isEditMode.set(true);
    this.selectedAlbumId.set(album.id);
    this.form.set({
      title: album.title,
      description: album.description ?? '',
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    if (this.saving()) return;
    this.showForm.set(false);
    this.selectedAlbumId.set(null);
    this.form.set(this.emptyForm());
  }

  saveAlbum(): void {
    const currentForm = this.form();
    const title = currentForm.title.trim();

    if (!title) {
      window.alert('Please enter an album title.');
      return;
    }

    const payload: AlbumPayload = {
      title,
      description: currentForm.description?.trim() || undefined,
    };

    this.saving.set(true);

    const activeId = this.selectedAlbumId();

    // FIXED: Removed the accidental backslash from request$
    const request$ =
      this.isEditMode() && activeId
        ? this.albumService.updateAlbum(activeId, payload)
        : this.albumService.createAlbum(payload);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.closeFormAfterSave();
          this.refreshAlbums();
        },
        error: (error: unknown) => {
          console.error('Failed to save album:', error);
          window.alert('Could not save album. Please check the form and try again.');
        },
      });
  }

  private closeFormAfterSave(): void {
    this.showForm.set(false);
    this.selectedAlbumId.set(null);
    this.form.set(this.emptyForm());
  }

  viewAlbum(album: Album): void {
    this.albumService.getAlbumById(album.id).subscribe({
      next: (details) => {
        const songList = details.songs?.length
          ? details.songs.map((song: any) => song.title).join('\n')
          : 'No published songs';

        window.alert(
          `${details.title}\n\n` +
          `Description: ${details.description || 'No description'}\n\n` +
          `Published songs:\n${songList}`
        );
      },
      error: (error: unknown) => {
        console.error('Failed to load album details:', error);
        window.alert('Could not load album details.');
      },
    });
  }

  archiveAlbum(album: Album): void {
    const confirmed = window.confirm(
      `Archive "${album.title}"? Your backend will change its title.`
    );

    if (!confirmed) return;

    this.archivingId.set(album.id);

    this.albumService
      .archiveAlbum(album.id)
      .pipe(finalize(() => this.archivingId.set(null)))
      .subscribe({
        next: () => this.refreshAlbums(),
        error: (error: unknown) => {
          console.error('Failed to archive album:', error);
          window.alert('Could not archive album.');
        },
      });
  }

  getSongCount(album: Album): number {
    return album.songs?.length ?? 0;
  }
}
