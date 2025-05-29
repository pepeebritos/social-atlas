export interface Post {
  id: string;
  type: string;
  authorId: string;
  content?: {
    title?: string;
    description?: string;
    imageUrl?: string; // For single photo
    imageUrls?: string[]; // For multi-photo
    caption?: string;
    location?: string;
    routeGeoJSON?: string;
    articleUrl?: string;
  };
  likes: string[];
  comments: {
    userId: string;
    name: string;
    text: string;
    createdAt: any;
  }[];
}
