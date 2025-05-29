'use client';

import Masonry from 'react-masonry-css';
import PostCard from './PostCard';

interface MasonryFeedProps {
  posts: any[];
}

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  768: 2,
  500: 1
};

export default function MasonryFeed({ posts }: MasonryFeedProps) {
  return (
    <div className="px-4 pt-6">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-6"
        columnClassName="masonry-column"
      >
        {posts.map((post) => {
          const displaySize = post.content?.displaySize || 'medium';
          const isLarge = displaySize === 'large';

          return (
            <div
              key={post.id}
              className={`mb-6 ${isLarge ? 'w-full md:w-[calc(200%+1.5rem)]' : ''}`}
            >
              <PostCard post={post} />
            </div>
          );
        })}
      </Masonry>
    </div>
  );
}
