
export type SongStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';

export interface AudioUploadResponse {
    audioPath: string;
}

export interface Song {
    id: string;
    title: string;
    description?: string | null;
    artists: string[];
    audioPath: string;
    albumId?: string | null;
    album?: {
        id: string;
        title: string;
    } | null;
    releaseDate?: string | null;
    status: SongStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSongPayload {
    title: string;
    description?: string;
    artists: string[];
    audioPath: string;
    albumId?: string;
    releaseDate?: string;
}

export interface UpdateSongPayload {
    title?: string;
    description?: string;
    artists?: string[];
    albumId?: string;
    releaseDate?: string;
}