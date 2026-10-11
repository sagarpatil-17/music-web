
export interface AlbumSong {
  id: string;
  title: string;
  status?: string;
}

export interface Album {
  id: string;
  title: string;
  description?: string | null;
  createdAt?: string;
  songs?: AlbumSong[];
}

export interface AlbumPayload {
  title: string;
  description?: string;
}
