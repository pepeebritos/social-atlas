import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from 'lib/utils';

interface ClassicArticleCardProps {
  title: string;
  coverImageUrl: string;
  bodyText: string;
  displaySize: 'small' | 'medium' | 'large';
  cardHeight: number; // in pixels
}

export function ClassicArticleCard({
  title,
  coverImageUrl,
  bodyText,
  displaySize,
  cardHeight,
}: ClassicArticleCardProps) {
  const hasImage = !!coverImageUrl && displaySize !== 'small';

  const imageHeightPx =
    displaySize === 'medium' ? 160 :
    displaySize === 'large' ? 256 : 0;

  const titleHeight = 40;
  const spacingPadding = 24;

  const textBlockHeight = hasImage
    ? cardHeight - titleHeight - imageHeightPx - spacingPadding
    : cardHeight - titleHeight - spacingPadding;

  const titleClass = cn(
    'font-bold leading-snug mb-1',
    displaySize === 'large' ? 'text-base' :
    displaySize === 'medium' ? 'text-sm' : 'text-sm'
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, [bodyText, cardHeight]);

  return (
    <div className="px-2 pb-1 flex flex-col gap-2 overflow-hidden h-full justify-start">
      {/* Title */}
      {title && (
        <div className={titleClass}>
          {title}
        </div>
      )}

      {/* Cover image */}
      {hasImage && (
        <div
          className={cn('w-full overflow-hidden rounded-md', {
            'h-40': displaySize === 'medium',
            'h-64': displaySize === 'large',
          })}
        >
          <Image
            src={coverImageUrl}
            alt={title || 'Cover'}
            width={800}
            height={500}
            className="object-cover w-full h-full rounded-md"
          />
        </div>
      )}

      {/* Body text */}
      {bodyText && (
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            className="text-xs text-neutral-700 whitespace-pre-wrap overflow-y-auto select-text pr-1 pb-6"
            style={{ maxHeight: `${textBlockHeight}px` }}
          >
            {bodyText}
          </div>

          {/* Tap to read more — no fade */}
          {isOverflowing && (
            <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-neutral-400 italic pt-1 bg-[#FDFBF5]">
              Tap to read more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
