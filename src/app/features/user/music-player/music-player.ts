
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MusicPlayerService } from '../../../core/services/music-player.service';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-player.html',
})
export class MusicPlayer {
  readonly player = inject(MusicPlayerService);

  onSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.player.seek(Number(input.value));
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.player.setVolume(Number(input.value));
  }
}
