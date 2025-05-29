'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

const POST_TYPES = ['article', 'journal', 'guide'] as const;
type PostSubtype = typeof POST_TYPES[number];

const TEMPLATES = [
  {
    id: 'classic-article',
    name: 'Classic Article',
    description: 'Clean blog-style layout with title, cover, and body.',
    free: true,
  },
  {
    id: 'split-article',
    name: 'Split Layout',
    description: 'Modern grid-style layout for visuals + text.',
    free: false,
  },
  {
    id: 'timeline-journal',
    name: 'Timeline Journal',
    description: 'Minimal journal layout with date and flow.',
    free: false,
  },
];

interface CreateWritePostFormProps {
  onPostCreated: (newPost: any) => void;
  setUploadProgress: (percent: number) => void;
  onClose: () => void;
}

export default function CreateWritePostForm({ onPostCreated, setUploadProgress, onClose }: CreateWritePostFormProps) {
  const [subtype, setSubtype] = useState<PostSubtype>('article');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isSelling, setIsSelling] = useState(false);
  const [price, setPrice] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [displaySize, setDisplaySize] = useState<'small' | 'medium' | 'large'>(getRandomSize());
  const [rerollUsed, setRerollUsed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic-article');

  function getRandomSize(): 'small' | 'medium' | 'large' {
    const options = ['small', 'medium', 'large'] as const;
    return options[Math.floor(Math.random() * options.length)];
  }

  const handleReroll = () => {
    if (rerollUsed) return;
    setDisplaySize(getRandomSize());
    setRerollUsed(true);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    onClose();
    setIsUploading(true);
    setUploadProgress(5);

    try {
      let coverImageUrl = '';
      let pdfUrl = '';

      if (coverImage) {
        const coverRef = ref(storage, `covers/${uuidv4()}`);
        const uploadTask = uploadBytesResumable(coverRef, coverImage);
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 30;
              setUploadProgress(Math.min(30, Math.round(progress)));
            },
            reject,
            async () => {
              coverImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(null);
            }
          );
        });
      }

      if (pdfFile && subtype === 'guide') {
        const pdfRef = ref(storage, `guides/${uuidv4()}`);
        const uploadTask = uploadBytesResumable(pdfRef, pdfFile);
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = 30 + (snapshot.bytesTransferred / snapshot.totalBytes) * 30;
              setUploadProgress(Math.min(60, Math.round(progress)));
            },
            reject,
            async () => {
              pdfUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(null);
            }
          );
        });
      }

      const newPost = {
        type: 'write',
        subtype,
        title,
        body,
        caption,
        location,
        displaySize,
        templateId: selectedTemplate,
        coverImageUrl,
        pdfUrl,
        isPaid: isSelling,
        price: isSelling ? Number(price) : null,
        createdAt: serverTimestamp(),
        authorId: auth.currentUser.uid,
        isPremiumUser: false
      };

      const docRef = await addDoc(collection(db, 'posts'), newPost);
      setUploadProgress(100);
      onPostCreated({ ...newPost, id: docRef.id });

      setSubtype('article');
      setTitle('');
      setBody('');
      setCaption('');
      setLocation('');
      setCoverImage(null);
      setCoverPreview(null);
      setPdfFile(null);
      setPrice('');
      setIsSelling(false);
      setDisplaySize(getRandomSize());
      setRerollUsed(false);
      setIsUploading(false);
      setSelectedTemplate('classic-article');
    } catch (err) {
      console.error('Error uploading post:', err);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };
  return (
    <div className="bg-[#1D5136] rounded-xl px-4 py-5 space-y-5 text-white border border-white/10 w-full max-w-md max-h-[80vh] overflow-y-auto mx-auto">
      <div>
        <label className="text-sm font-semibold mb-2 block">Post Type</label>
        <div className="flex gap-2">
          {POST_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSubtype(type)}
              className={cn(
                'px-4 py-1.5 rounded-full border text-sm capitalize transition',
                subtype === type
                  ? 'bg-white text-black border-white'
                  : 'border-white/20 hover:bg-white/10'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold mb-2 block">Template</label>
        <div className="grid grid-cols-1 gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => tpl.free && setSelectedTemplate(tpl.id)}
              className={cn(
                'w-full text-left p-3 rounded-md border transition',
                tpl.id === selectedTemplate ? 'border-white bg-white/10' : 'border-white/10 hover:bg-white/5',
                !tpl.free && 'opacity-40 cursor-not-allowed relative'
              )}
            >
              <div className="font-semibold text-sm">
                {tpl.name} {!tpl.free && '🔒'}
              </div>
              <div className="text-xs text-white/80">{tpl.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold mb-2 block">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white text-black placeholder:text-gray-400"
          placeholder="Enter your post title"
        />
      </div>

      <div>
  <label className="text-sm font-semibold mb-2 block">Body</label>
  <div className="bg-white text-black rounded-md p-2">
  <RichEditor
  value={body}
  onChange={(html) => setBody(html)}
/>

  </div>
</div>


      <div>
        <label className="text-sm font-semibold mb-2 block">Cover Image (optional)</label>
        <Input type="file" accept="image/*" onChange={handleCoverChange} className="bg-white text-black" />
        {coverPreview && (
          <img src={coverPreview} alt="Cover Preview" className="mt-2 w-full rounded-lg border border-white/10" />
        )}
      </div>

      {subtype === 'guide' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold mb-2 block">Upload PDF (optional)</label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="bg-white text-black"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Sell this guide?</label>
            <Switch checked={isSelling} onCheckedChange={setIsSelling} />
          </div>

          {isSelling && (
            <div>
              <label className="text-sm font-semibold mb-2 block">Price (USD)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-white text-black"
                placeholder="e.g. 8"
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Caption</label>
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="bg-white text-black"
            placeholder="Short caption shown in the feed"
          />
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">Location</label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-white text-black"
            placeholder="Optional location"
          />
        </div>
      </div>

      <div className="mt-2 bg-[#1b1b1b] rounded-md px-4 py-2 text-sm border border-white/10 flex justify-between items-center">
        <span>Size: {displaySize.toUpperCase()}</span>
        {!rerollUsed && (
          <button
            onClick={handleReroll}
            className="text-xs px-3 py-1 rounded-md bg-white/10 border border-white hover:bg-white/20"
          >
            Reroll Size
          </button>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isUploading || !title || !body}
        className="w-full bg-white text-black font-semibold hover:bg-gray-200"
      >
        {isUploading ? 'Posting...' : 'Post'}
      </Button>
    </div>
  );
}

