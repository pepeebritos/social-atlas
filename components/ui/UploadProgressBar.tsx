'use client';

import { motion } from 'framer-motion';

interface UploadProgressBarProps {
  percent: number;
}

export default function UploadProgressBar({ percent }: UploadProgressBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#2e2e2e] border border-gray-600 text-white px-6 py-3 rounded-full shadow-xl w-[300px]">
      <div className="text-sm font-medium mb-1">Uploading... {percent.toFixed(0)}%</div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-2 bg-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
        />
      </div>
    </div>
  );
}
