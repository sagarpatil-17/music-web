
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
  audioPath: string;
  albumId?: string | null;
  album?: { id: string; title: string } | null;
  releaseDate?: string | null;
  status: SongStatus;
  createdAt: string;
  updatedAt: string;
}
