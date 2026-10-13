
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../admin/songs/songs.service';
import { Song } from '../../admin/songs/songs.model';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Subject, startWith, tap, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
})
export class Home {
  private readonly songService = inject(SongService);

  // 1. Writable signal for the template's search bar binding
  searchTerm = signal('');

  // 2. State management variables
  loading = signal(false);
  errorMessage = signal('');

  // 3. RxJS Subject to trigger the search stream safely on click
  private searchAction$ = new Subject<string>();

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
}
