// Development-only fixture, not included in the production entry point.
import { createRoot } from 'react-dom/client';
import { SavedArtwork } from '../src/components/SavedArtwork';
import { PageSkeleton } from '../src/components/PageSkeleton';
import '../src/styles/globals.css';
createRoot(document.getElementById('root')!).render(<main className="page-shell py-8"><h1>Artwork recovery checks</h1><div className="mt-6 grid grid-cols-2 gap-4"><section><h2>Local fallback</h2><SavedArtwork sources={['/missing-image-qa.jpg','/anime/hyouka.jpg']} title="Hyouka fallback" /></section><section><h2>Unavailable artwork</h2><SavedArtwork sources={['/missing-image-qa.jpg']} title="Missing artwork" /></section></div><PageSkeleton /></main>);
