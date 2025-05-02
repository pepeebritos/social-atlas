'use client';

import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs
} from 'firebase/firestore';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonText?: string;
}

export default function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type something...',
  buttonText = 'Post'
}: MentionInputProps) {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mirrorRef.current && inputRef.current) {
      const inputStyle = window.getComputedStyle(inputRef.current);
      mirrorRef.current.innerText = value + '\u200b';
      mirrorRef.current.style.font = inputStyle.font;
      mirrorRef.current.style.padding = inputStyle.padding;
      mirrorRef.current.style.border = inputStyle.border;
    }

    const atMatch = value.match(/@([a-zA-Z0-9._]*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentionDropdown(true);
      fetchMentionResults(atMatch[1]);
    } else {
      setShowMentionDropdown(false);
    }
  }, [value]);

  const fetchMentionResults = async (queryText: string) => {
    const usernamesRef = collection(db, 'usernames');
    const snapshot = await getDocs(usernamesRef);
    const matches = snapshot.docs
      .map((doc) => ({ username: doc.id, uid: doc.data().uid }))
      .filter((user) => user.username.toLowerCase().startsWith(queryText.toLowerCase()));

    const enriched = await Promise.all(
      matches.map(async (user) => {
        const userRef = doc(collection(db, 'users'), user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        return {
          username: user.username,
          uid: user.uid,
          profilePic: userData.profilePic || '/default-avatar.png',
        };
      })
    );

    setMentionResults(enriched);

    setTimeout(() => {
      if (mirrorRef.current && dropdownRef.current) {
        const rect = mirrorRef.current.getBoundingClientRect();
        dropdownRef.current.style.top = `${rect.bottom + 4}px`;
        dropdownRef.current.style.left = `${rect.left}px`;
      }
    }, 0);
  };

  const handleMentionClick = (username: string) => {
    const updated = value.replace(/@([a-zA-Z0-9._]*)$/, `@${username} `);
    onChange(updated);
    setShowMentionDropdown(false);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 w-full rounded px-3 py-2 bg-[#1e1e1e] text-white border border-gray-600"
      />

      {/* Hidden mirror for caret tracking */}
      <div
        ref={mirrorRef}
        className="absolute top-0 left-0 invisible whitespace-pre-wrap break-words p-2 text-sm font-normal"
        style={{
          whiteSpace: 'pre-wrap',
          visibility: 'hidden',
          position: 'absolute',
          zIndex: -1,
          pointerEvents: 'none',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      ></div>

      <button
        onClick={onSubmit}
        className="absolute right-0 top-0 bottom-0 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-r"
      >
        {buttonText}
      </button>

      {showMentionDropdown && (
        <div
          ref={dropdownRef}
          className="absolute bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto w-full z-50"
          style={{ top: 0, left: 0 }}
        >
          {mentionResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">No users found.</div>
          ) : (
            mentionResults.map((user, i) => (
              <div
                key={i}
                onClick={() => handleMentionClick(user.username)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-white border-b border-gray-700 hover:bg-[#3a3a3a] cursor-pointer transition duration-150 ease-in-out"
              >
                <img
                  src={user.profilePic}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border border-gray-500"
                />
                <span className="text-white font-medium">@{user.username}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
