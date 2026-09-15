import { useState } from 'react';
import './App.css';

interface Clip {
  id: string;
  start: number;
  end: number;
  score: number;
  download_url: string;
}

function App() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-hf-space.hf.space';

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${BACKEND_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Backend error');
      
      const data = await response.json();
      setClips(data.clips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎬 Opus Clip</h1>
      <UploadForm onUpload={handleUpload} loading={loading} />
      {error && <div className="error">{error}</div>}
      {clips.length > 0 && <ClipsList clips={clips} />}
    </div>
  );
}

interface UploadFormProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

function UploadForm({ onUpload, loading }: UploadFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="upload-form">
      <label htmlFor="video-input">
        📹 Upload MP4 (max 30min)
      </label>
      <input
        id="video-input"
        type="file"
        accept="video/mp4"
        onChange={handleChange}
        disabled={loading}
      />
      {loading && <p>⏳ Processing... (peut prendre quelques minutes)</p>}
    </div>
  );
}

interface ClipsListProps {
  clips: Clip[];
}

function ClipsList({ clips }: ClipsListProps) {
  return (
    <div className="clips-list">
      <h2>✂️ Clips générés ({clips.length})</h2>
      {clips.map((clip) => (
        <div key={clip.id} className="clip-card">
          <div className="clip-info">
            <p><strong>Score:</strong> {(clip.score * 100).toFixed(0)}%</p>
            <p><strong>Durée:</strong> {Math.round(clip.end - clip.start)}s</p>
          </div>
          <a href={clip.download_url} download className="btn-download">
            💾 Download
          </a>
        </div>
      ))}
    </div>
  );
}

export default App;
