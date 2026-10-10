
export type AlbumType = 'SINGLE' | 'EP' | 'ALBUM';

export interface Album {
  id: string;
  title: string;
  description?: string | null;
  artistId: string;
  coverImagePath?: string | null;
  albumType: AlbumType;
  releaseDate?: string | null;
  songs?: SongSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface SongSummary {
  id: string;
  title: string;
  artists: string[];
  audioPath: string;
  status: string;
}
