/**
 * Gallery type definitions
 */

export interface GalleryPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface GalleryVideo {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryAlbum {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  coverImage: string;
  photos: GalleryPhoto[];
  videos?: GalleryVideo[];
}

export interface GalleryAlbumPageContext {
  slug: string;
}