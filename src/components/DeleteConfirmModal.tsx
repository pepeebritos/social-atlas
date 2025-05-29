'use client';

import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-40" aria-hidden="true" />

        <div className="relative bg-[#1D5136] text-black rounded-xl shadow-xl p-6 w-full max-w-md z-50">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>

          <Dialog.Title className="text-lg font-semibold mb-4 text-white">
            Delete Post?
          </Dialog.Title>

          <p className="text-sm text-white mb-6">
            This action can’t be undone. Are you sure you want to permanently delete this post?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md bg-white text-black hover:bg-neutral-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
