// SplitArticleCard.tsx
import Image from 'next/image';
import { cn } from 'lib/utils';

interface SplitArticleCardProps {
  title: string;
  coverImageUrl: string;
  bodyText: string;
}

export function SplitArticleCard({ title, coverImageUrl, bodyText }: SplitArticleCardProps) {
  return (
    <div className="flex gap-3 items-start px-2">
      <div className="relative flex-shrink-0 rounded-md overflow-hidden w-[40%] aspect-square">
        <Image src={coverImageUrl} alt={title || 'Cover'} fill className="object-cover" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {title && <div className="text-sm font-bold text-neutral-900 line-clamp-2">{title}</div>}
        <div className="text-xs text-neutral-600 leading-snug line-clamp-[6] whitespace-pre-wrap">
          {bodyText}
        </div>
      </div>
    </div>
  );
}

