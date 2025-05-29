'use client';

import { useEffect, useState, useRef } from 'react';
import {
  createEmptyGrid,
  POST_SIZE_MAP,
  LayoutPost,
  getAutoSizeFor,
  DisplaySize,
  GRID_COLUMNS,
  GRID_CELL_WIDTH,
  GRID_CELL_HEIGHT,
  GAP,
  MARGIN
} from 'lib/utils/LayoutEngine';
import PostCard from './PostCard';
import { useInView } from 'react-intersection-observer';
import { ChevronUp } from 'lucide-react';

interface GridFeedProps {
  posts?: any[];
  onLoadMore?: () => void;
}

interface PositionedPost extends LayoutPost {
  top: number;
  left: number;
  width: number;
  height: number;
  post: any;
}

const CONTAINER_WIDTH = GRID_COLUMNS * (GRID_CELL_WIDTH + GAP) + MARGIN * 2;
const TOP_OFFSET = 24; // offset for topbar

export default function GridFeed({ posts = [], onLoadMore }: GridFeedProps) {
  const [positionedPosts, setPositionedPosts] = useState<PositionedPost[]>([]);
  const [layoutKey, setLayoutKey] = useState(0);
  const [maxBottom, setMaxBottom] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowBackToTop(window.scrollY > 600);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (inView && onLoadMore) {
      setIsLoadingMore(true);
      onLoadMore();
      const timeout = setTimeout(() => {
        setIsLoadingMore(false);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [inView, onLoadMore]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!posts || posts.length === 0) return;

      const grid = createEmptyGrid(50, GRID_COLUMNS);
      const results: PositionedPost[] = [];
      let newMaxBottom = 0;

      const sortedPosts = [...posts].sort((a, b) => {
        const timeA = a.createdAt?.seconds ?? a.createdAt ?? 0;
        const timeB = b.createdAt?.seconds ?? b.createdAt ?? 0;
        return timeB - timeA;
      });

      for (const post of sortedPosts) {
        const shape = getPostShape(post);
        let position = placePost(grid, shape);
        if (!position) position = placePost(grid, shape, 20);
        if (!position) {
          const y = grid.length - shape.h;
          position = {
            top: y * (GRID_CELL_HEIGHT + GAP) + TOP_OFFSET,
            left: MARGIN,
            width: shape.w * GRID_CELL_WIDTH + (shape.w - 1) * GAP,
            height: shape.h * GRID_CELL_HEIGHT + (shape.h - 1) * GAP
          };
        }
        const bottom = position.top + position.height;
        if (bottom > newMaxBottom) newMaxBottom = bottom;

        results.push({
          id: post.id,
          type: post.type === 'write' ? 'write' : post.type,
          isPremiumUser: post.isPremiumUser ?? false,
          displaySize: shape.displaySize,
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
          post
        });
      }

      setPositionedPosts(results);
      setMaxBottom(newMaxBottom);
      setLayoutKey(prev => prev + 1);
    }, 50);

    return () => clearTimeout(timeout);
  }, [posts]);

  return (
    <div style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <div
        key={layoutKey}
        style={{
          position: 'relative',
          width: `${CONTAINER_WIDTH}px`,
          margin: '0 auto',
          minHeight: `${maxBottom + 300}px`,
          overflowX: 'visible',
          willChange: 'transform'
        }}
      >
        {positionedPosts.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: item.top,
              left: item.left,
              width: item.width,
              height: item.height
            }}
          >
            <PostCard post={item.post} />
          </div>
        ))}

        {onLoadMore && isLoadingMore && (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              style={{
                position: 'absolute',
                top: maxBottom + i * 220,
                left: MARGIN,
                width: GRID_CELL_WIDTH * 2 + GAP,
                height: GRID_CELL_HEIGHT * 2 + GAP,
                backgroundColor: '#eaeaea',
                borderRadius: 16,
                animation: 'pulse 1.6s ease-in-out infinite'
              }}
            />
          ))
        )}

        {onLoadMore && <div ref={ref} style={{ position: 'absolute', top: maxBottom + 100, height: 1 }} />}
      </div>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-4 z-50 bg-[#1D5136] hover:bg-green-700 text-white p-3 rounded-full shadow-lg"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function getPostShape(post: any): { w: number; h: number; displaySize: DisplaySize } {
  const rawSize = post.content?.displaySize;
  const size: DisplaySize = !rawSize || rawSize === 'auto'
    ? getAutoSizeFor(post.type === 'write' ? 'write' : post.type)
    : rawSize;

  const shape = POST_SIZE_MAP[post.type === 'write' ? 'write' : post.type]?.[size];
  if (!shape) {
    return { ...POST_SIZE_MAP['photo']['medium'], displaySize: 'medium' };
  }

  return { ...shape, displaySize: size };
}

function placePost(grid: boolean[][], { w, h }: { w: number; h: number }, startRow = 0) {
  const ROWS = grid.length;
  const COLS = grid[0].length;

  for (let y = startRow; y <= ROWS - h; y++) {
    for (let x = 0; x <= COLS - w; x++) {
      const leftOffset = MARGIN + x * (GRID_CELL_WIDTH + GAP);
      const postWidth = w * GRID_CELL_WIDTH + (w - 1) * GAP;
      const maxWidth = GRID_COLUMNS * (GRID_CELL_WIDTH + GAP);
      if (leftOffset + postWidth > maxWidth) continue;

      let fits = true;
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          if (grid[y + dy]?.[x + dx]) {
            fits = false;
            break;
          }
        }
        if (!fits) break;
      }

      if (fits) {
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            grid[y + dy][x + dx] = true;
          }
        }

        return {
          top: y * (GRID_CELL_HEIGHT + GAP) + TOP_OFFSET,
          left: MARGIN + x * (GRID_CELL_WIDTH + GAP),
          width: postWidth,
          height: h * GRID_CELL_HEIGHT + (h - 1) * GAP
        };
      }
    }
  }

  return null;
}
