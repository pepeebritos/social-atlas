// TimelineJournalCard.tsx
import { format } from 'date-fns';

interface TimelineJournalCardProps {
  title: string;
  bodyText: string;
  createdAt?: any;
}

export function TimelineJournalCard({ title, bodyText, createdAt }: TimelineJournalCardProps) {
  const date = createdAt?.toDate ? createdAt.toDate() : new Date();

  return (
    <div className="flex flex-col gap-1 px-2 pb-1 text-[#333] bg-[#fefaf0] rounded-md">
      <div className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">
        {format(date, 'MMM d, yyyy')}
      </div>
      {title && <div className="text-sm font-semibold text-[#222] line-clamp-2">{title}</div>}
      <div className="text-xs leading-snug whitespace-pre-wrap line-clamp-[10] font-serif">
        {bodyText}
      </div>
    </div>
  );
}

