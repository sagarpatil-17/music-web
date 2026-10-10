
export type SongStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'PUBLISHED'
  | 'UNPUBLISHED';

export interface Song {
  id: string;
  title: string;
  description?: string | null;
  artists: string[];
  albumId?: string | null;
  audioPath: string;
  status: SongStatus;
  playCount: number;
  releaseDate?: string | null;
  createdAt: string;
  updatedAt: string;
}
