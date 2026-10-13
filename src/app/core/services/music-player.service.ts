
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Song } from '../../features/admin/songs/songs.model';

interface PlaybackResponse {
  url: string;
}

@Injectable({ providedIn: 'root' })
export class MusicPlayerService {
  private readonly apiUrl = environment.apiUrl;
  private readonly audio = new Audio();
  private progressTimer: ReturnType<typeof setInterval> | null = null;

  readonly currentSong = signal<Song | null>(null);
  readonly queue = signal<Song[]>([]);
  readonly isPlaying = signal(false);
  readonly isLoading = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly volume = signal(0.8);
  readonly errorMessage = signal('');

  constructor(private readonly http: HttpClient) {
    this.audio.volume = this.volume();

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
      this.errorMessage.set('');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.set(this.audio.currentTime || 0);
    });

    this.audio.addEventListener('durationchange', () => {
      this.duration.set(
        Number.isFinite(this.audio.duration) ? this.audio.duration : 0
      );
    });

    this.audio.addEventListener('ended', () => {
      void this.next();
    });

    this.audio.addEventListener('error', () => {
      if (this.currentSong()) {
        this.errorMessage.set('Unable to play this track. Try playing it again.');
      }
      this.isLoading.set(false);
    });

    this.audio.addEventListener('waiting', () => {
      this.isLoading.set(true);
    });

    this.audio.addEventListener('canplay', () => {
      this.isLoading.set(false);
    });

    this.progressTimer = setInterval(() => {
      if (this.isPlaying()) {
        this.currentTime.set(this.audio.currentTime || 0);
      }
    }, 1000);
  }

  async playSong(song: Song, songs?: Song[]): Promise<void> {
    if (songs?.length) {
      this.queue.set(songs);
    }

    if (this.currentSong()?.id === song.id) {
      if (this.audio.paused) {
        await this.resume();
      } else {
        this.pause();
      }
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.currentSong.set(song);
    this.currentTime.set(0);
    this.duration.set(0);
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();

    try {
      const response = await firstValueFrom(
        this.http.get<PlaybackResponse>(
          `${this.apiUrl}/songs/${song.id}/playback`
        )
      );

      if (!response?.url) {
        throw new Error('The playback URL was not returned by the server.');
      }

      this.audio.src = response.url;
      this.audio.volume = this.volume();
      this.audio.load();

      await this.audio.play();
    } catch (error) {
      console.error('Playback failed:', error);
      this.errorMessage.set(
        'Unable to play this track. Please try again.'
      );
      this.isPlaying.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  async resume(): Promise<void> {
    try {
      await this.audio.play();
      this.errorMessage.set('');
    } catch (error) {
      console.error('Unable to resume playback:', error);
      this.errorMessage.set('Playback could not start. Please try again.');
    }
  }

  pause(): void {
    this.audio.pause();
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
    } else if (this.currentSong()) {
      void this.resume();
    }
  }

  seek(seconds: number): void {
    if (!Number.isFinite(seconds) || !Number.isFinite(this.audio.duration)) {
      return;
    }

    this.audio.currentTime = Math.max(
      0,
      Math.min(seconds, this.audio.duration)
    );
    this.currentTime.set(this.audio.currentTime);
  }

  setVolume(value: number): void {
    const nextVolume = Math.max(0, Math.min(1, value));
    this.volume.set(nextVolume);
    this.audio.volume = nextVolume;
  }

  async next(): Promise<void> {
    const songs = this.queue();
    const current = this.currentSong();

    if (!current || !songs.length) {
      this.pause();
      return;
    }

    const index = songs.findIndex(song => song.id === current.id);

    if (index >= 0 && index < songs.length - 1) {
      await this.playSong(songs[index + 1]);
    } else {
      this.pause();
      this.seek(0);
    }
  }

  async previous(): Promise<void> {
    if (this.audio.currentTime > 3) {
      this.seek(0);
      return;
    }

    const songs = this.queue();
    const current = this.currentSong();

    if (!current || !songs.length) {
      return;
    }

    const index = songs.findIndex(song => song.id === current.id);

    if (index > 0) {
      await this.playSong(songs[index - 1]);
    } else {
      this.seek(0);
    }
  }

  formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  }
}
