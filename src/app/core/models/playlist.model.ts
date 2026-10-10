
import { User } from './user.model';

export type PlaylistVisibility = 'PUBLIC' | 'PRIVATE';

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  position: number;
  addedAt: string;
  song?: import('./song.model').Song;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  coverImagePath?: string | null;
  visibility: PlaylistVisibility;
  userId: string;
  user?: User;
  songs?: PlaylistSong[];
  createdAt: string;
  updatedAt: string;
}
