// Native share (Web Share API) for the generated design and song.
// No backend: we share real files to the OS share sheet (Messages, Mail, WhatsApp,
// AirDrop…). Where file-sharing isn't supported, we fall back to a download.
//
// Returns one of: 'shared' | 'downloaded' | 'cancelled'. A user-cancelled share
// (AbortError) is 'cancelled' (no error toast).

import { cardFrontToBlob } from './cardExport';

type ShareResult = 'shared' | 'downloaded' | 'cancelled';

interface ShareTextOptions {
  title: string;
  text: string;
}

interface CardInput {
  imageUrl: string;
  frontText?: { text?: string; styleId?: string; color?: string; placement?: string };
}

interface SongInput {
  audioUrl?: string;
  title?: string;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareFiles(files: File[], { title, text }: ShareTextOptions, fallback: () => void): Promise<ShareResult> {
  try {
    if (navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({ files, title, text });
      return 'shared';
    }
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') return 'cancelled';
    // fall through to fallback on any share failure
  }
  fallback();
  return 'downloaded';
}

// audioUrl may be a blob: or data: URL — fetch resolves both.
async function audioToFile(song: SongInput): Promise<File | null> {
  if (!song?.audioUrl) return null;
  try {
    const res = await fetch(song.audioUrl);
    const blob = await res.blob();
    const ext = (blob.type.split('/')[1] || 'mp3').replace('mpeg', 'mp3');
    const name = `${(song.title || 'occasio-song').replace(/[^\w-]+/g, '_')}.${ext}`;
    return new File([blob], name, { type: blob.type || 'audio/mpeg' });
  } catch {
    return null;
  }
}

/** Share the finished design image (and the song file when present). */
export async function shareDesign({ card, song, text = 'Made you something with Occasio ✨' }: { card: CardInput; song?: SongInput | null; text?: string }): Promise<ShareResult> {
  const blob = await cardFrontToBlob(card);
  if (!blob) return 'cancelled';
  const designFile = new File([blob], 'occasio-design.png', { type: 'image/png' });

  const files: File[] = [designFile];
  const songFile = song ? await audioToFile(song) : null;
  if (songFile && navigator.canShare?.({ files: [designFile, songFile] })) {
    files.push(songFile);
  }

  return shareFiles(files, { title: 'Occasio', text }, () => downloadBlob(blob, 'occasio-design.png'));
}

/** Share just the song audio (song-preview screen). */
export async function shareSong({ song, text = 'Listen to this 🎵' }: { song: SongInput; text?: string }): Promise<ShareResult> {
  const file = await audioToFile(song);
  if (!file) return 'cancelled';
  return shareFiles([file], { title: 'Occasio', text }, () => downloadBlob(file, file.name));
}
