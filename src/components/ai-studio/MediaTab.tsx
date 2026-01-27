import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { GeneratedContentCard } from './GeneratedContentCard';
import { analyzeImage, transcribeAudio } from '../../services/geminiService';
import { 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Upload, 
  Sparkles,
  FileImage,
  FileVideo,
  FileAudio
} from 'lucide-react';

/**
 * MediaTab
 * ========
 * AI-powered media analysis tools migrated from the original AI Forge.
 * Features: Image Analysis, Video Analysis, Audio Transcription
 */

// Shared media card component with CMF styling
const MediaAnalyzerCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  description: string;
  children: React.ReactNode;
}> = ({ title, icon, description, children }) => (
  <Card variant="elevated" className="h-full flex flex-col card-glow-hover">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div 
          className="p-2.5 rounded-lg"
          style={{ 
            background: 'linear-gradient(135deg, var(--aurora-teal), var(--aurora-cyan))',
            boxShadow: 'var(--aurora-glow-sm)'
          }}
        >
          <span className="text-slate-900">{icon}</span>
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
            {description}
          </p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex-1 flex flex-col">
      {children}
    </CardContent>
  </Card>
);

// File upload dropzone component
const FileDropzone: React.FC<{
  accept: string;
  onFileSelect: (file: File) => void;
  selectedFile: { name: string } | null;
  icon: React.ReactNode;
  label: string;
  preview?: React.ReactNode;
}> = ({ accept, onFileSelect, selectedFile, icon, label, preview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative p-6 rounded-xl cursor-pointer transition-all duration-200
        flex flex-col items-center justify-center gap-3 min-h-[160px]
        ${isDragging ? 'scale-[1.02]' : ''}
      `}
      style={{
        backgroundColor: isDragging ? 'var(--cmf-accent-subtle)' : 'var(--cmf-surface-2)',
        border: `2px dashed ${isDragging ? 'var(--aurora-teal)' : 'var(--cmf-border)'}`,
      }}
    >
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        className="hidden"
      />
      
      {preview || (
        <>
          <div 
            className="p-3 rounded-full"
            style={{ backgroundColor: 'var(--cmf-surface)' }}
          >
            {icon}
          </div>
          <div className="text-center">
            <p className="font-medium" style={{ color: 'var(--cmf-text)' }}>
              {selectedFile ? selectedFile.name : label}
            </p>
            <p className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
              {selectedFile ? 'Click to change' : 'Drag & drop or click to browse'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

// Image Analyzer Component
const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<{ b64: string; mime: string; name: string; url: string } | null>(null);
  const [prompt, setPrompt] = useState('Describe this image in detail.');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      if (!b64 || b64.trim().length === 0) return;
      setImage({ 
        b64, 
        mime: file.type, 
        name: file.name,
        url: URL.createObjectURL(file)
      });
      setResult('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image?.b64) return;
    setIsLoading(true);
    setResult('');
    try {
      const response = await analyzeImage(image.b64, image.mime, prompt);
      setResult(response);
    } catch (error) {
      setResult('Error: Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MediaAnalyzerCard
      title="Image Analyzer"
      icon={<ImageIcon className="w-5 h-5" />}
      description="Upload an image for AI analysis"
    >
      <div className="space-y-4 flex-1 flex flex-col">
        <FileDropzone
          accept="image/*"
          onFileSelect={handleFileSelect}
          selectedFile={image}
          icon={<FileImage className="w-6 h-6" style={{ color: 'var(--cmf-text-muted)' }} />}
          label="Select an image"
          preview={image && (
            <img 
              src={image.url} 
              alt="Preview" 
              className="max-h-32 rounded-lg object-contain"
            />
          )}
        />

        <Textarea
          label="Analysis Prompt"
          placeholder="What would you like to know about this image?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          fullWidth
        />

        <Button
          variant="aurora"
          onClick={handleAnalyze}
          disabled={!image || isLoading}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-4 h-4" />}
          fullWidth
        >
          {isLoading ? 'Analyzing...' : 'Analyze Image'}
        </Button>

        {(result || isLoading) && (
          <GeneratedContentCard
            title="Analysis Result"
            content={result}
            isLoading={isLoading}
            onRegenerate={handleAnalyze}
            format="plain"
            className="mt-auto"
          />
        )}
      </div>
    </MediaAnalyzerCard>
  );
};

// Video Analyzer Component
const VideoAnalyzer: React.FC = () => {
  const [video, setVideo] = useState<{ name: string; url: string } | null>(null);
  const [firstFrame, setFirstFrame] = useState<{ b64: string; mime: string; url: string } | null>(null);
  const [prompt, setPrompt] = useState('What is happening in this scene?');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideo({ name: file.name, url });
    setResult('');

    // Extract first frame
    const videoEl = document.createElement('video');
    videoEl.src = url;
    videoEl.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      canvas.getContext('2d')?.drawImage(videoEl, 0, 0);
      const frameDataUrl = canvas.toDataURL('image/jpeg');
      const b64 = frameDataUrl.split(',')[1];
      if (b64) {
        setFirstFrame({ 
          b64, 
          mime: 'image/jpeg',
          url: frameDataUrl
        });
      }
    };
  };

  const handleAnalyze = async () => {
    if (!firstFrame?.b64) return;
    setIsLoading(true);
    setResult('');
    try {
      const response = await analyzeImage(firstFrame.b64, firstFrame.mime, prompt);
      setResult(response);
    } catch (error) {
      setResult('Error: Failed to analyze video frame. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MediaAnalyzerCard
      title="Video Analyzer"
      icon={<Video className="w-5 h-5" />}
      description="Analyze the first frame of a video"
    >
      <div className="space-y-4 flex-1 flex flex-col">
        <FileDropzone
          accept="video/*"
          onFileSelect={handleFileSelect}
          selectedFile={video}
          icon={<FileVideo className="w-6 h-6" style={{ color: 'var(--cmf-text-muted)' }} />}
          label="Select a video"
          preview={firstFrame && (
            <img 
              src={firstFrame.url} 
              alt="First frame preview" 
              className="max-h-32 rounded-lg object-contain"
            />
          )}
        />

        <Textarea
          label="Analysis Prompt"
          placeholder="What would you like to know about this video?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          fullWidth
        />

        <Button
          variant="aurora"
          onClick={handleAnalyze}
          disabled={!firstFrame || isLoading}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-4 h-4" />}
          fullWidth
        >
          {isLoading ? 'Analyzing...' : 'Analyze First Frame'}
        </Button>

        {(result || isLoading) && (
          <GeneratedContentCard
            title="Analysis Result"
            content={result}
            isLoading={isLoading}
            onRegenerate={handleAnalyze}
            format="plain"
            className="mt-auto"
          />
        )}
      </div>
    </MediaAnalyzerCard>
  );
};

// Audio Transcription Component
const AudioTranscription: React.FC = () => {
  const [audio, setAudio] = useState<{ b64: string; mime: string; name: string; url: string } | null>(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      if (!b64) return;
      setAudio({ b64, mime: file.type, name: file.name, url });
      setResult('');
    };
    reader.readAsDataURL(file);
  };

  const handleTranscribe = async () => {
    if (!audio?.b64) return;
    setIsLoading(true);
    setResult('');
    try {
      const response = await transcribeAudio(audio.b64, audio.mime);
      setResult(response);
    } catch (error) {
      setResult('Error: Failed to transcribe audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MediaAnalyzerCard
      title="Audio Transcription"
      icon={<Mic className="w-5 h-5" />}
      description="Convert speech to text"
    >
      <div className="space-y-4 flex-1 flex flex-col">
        <FileDropzone
          accept="audio/*"
          onFileSelect={handleFileSelect}
          selectedFile={audio}
          icon={<FileAudio className="w-6 h-6" style={{ color: 'var(--cmf-text-muted)' }} />}
          label="Select an audio file"
          preview={audio && (
            <div className="w-full">
              <audio src={audio.url} controls className="w-full" />
              <p className="text-sm text-center mt-2" style={{ color: 'var(--cmf-text-muted)' }}>
                {audio.name}
              </p>
            </div>
          )}
        />

        <Button
          variant="aurora"
          onClick={handleTranscribe}
          disabled={!audio || isLoading}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-4 h-4" />}
          fullWidth
        >
          {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
        </Button>

        {(result || isLoading) && (
          <GeneratedContentCard
            title="Transcription"
            content={result}
            isLoading={isLoading}
            onRegenerate={handleTranscribe}
            format="plain"
            className="mt-auto"
          />
        )}
      </div>
    </MediaAnalyzerCard>
  );
};

// Main MediaTab Component
export const MediaTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 
          className="text-xl font-semibold"
          style={{ color: 'var(--cmf-text)' }}
        >
          Media Analysis Tools
        </h2>
        <p 
          className="text-sm mt-1"
          style={{ color: 'var(--cmf-text-muted)' }}
        >
          Upload images, videos, or audio files to analyze and transcribe using AI.
        </p>
      </div>

      {/* Analyzers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ImageAnalyzer />
        <VideoAnalyzer />
        <AudioTranscription />
      </div>
    </div>
  );
};

export default MediaTab;
