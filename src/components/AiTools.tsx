
import React, { useState, useRef } from 'react';
import { analyzeImage, transcribeAudio } from '../services/geminiService';

const AiToolCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white/10 dark:bg-black/20 p-4 rounded-lg h-full flex flex-col">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 text-center flex items-center justify-center gap-2">
            {icon} {title}
        </h4>
        {children}
    </div>
);

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-white/30 rounded-md text-slate-600 hover:bg-white/50 dark:bg-black/30 dark:text-slate-300 dark:hover:bg-black/50 text-xs">
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};

const ImageAnalyzer: React.FC = () => {
    const [image, setImage] = useState<{b64: string, mime: string, name: string} | null>(null);
    const [prompt, setPrompt] = useState('Describe this image in detail.');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readEvent) => {
                const b64 = (readEvent.target?.result as string).split(',')[1];
                setImage({ b64, mime: file.type, name: file.name });
                setResult('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsLoading(true);
        setResult('');
        const response = await analyzeImage(image.b64, image.mime, prompt);
        setResult(response);
        setIsLoading(false);
    }
    
    return (
        <AiToolCard title="Image Analyzer" icon={<ImageIcon />}>
            <div className="p-4 border-2 border-dashed border-white/30 rounded-lg text-center flex-grow flex flex-col justify-center">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="text-cyan-600 font-semibold dark:text-cyan-400 hover:underline text-sm">
                    {image ? `Selected: ${image.name}` : 'Select an Image'}
                </button>
                {image && <img src={`data:${image.mime};base64,${image.b64}`} alt="preview" className="mt-4 max-h-24 mx-auto rounded-md" />}
            </div>
            <textarea 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)} 
                rows={2} 
                className="w-full p-2 border border-white/30 rounded-md mt-4 bg-white/20 dark:bg-black/20 text-sm placeholder-slate-500"
                placeholder="Enter a prompt..."
            />
            <button 
                onClick={handleAnalyze} 
                disabled={!image || isLoading} 
                className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-sky-600 text-white p-2 rounded-md disabled:opacity-50 text-sm font-semibold btn-hover-scale"
            >
                {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>
            {isLoading && <div className="text-center mt-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div></div>}
            {result && <div className="relative mt-4 p-3 bg-white/20 dark:bg-black/20 rounded-md whitespace-pre-wrap text-sm max-h-48 overflow-y-auto"><CopyButton text={result}/>{result}</div>}
        </AiToolCard>
    )
};

const VideoAnalyzer: React.FC = () => {
    const [video, setVideo] = useState<{ url: string; name: string } | null>(null);
    const [firstFrame, setFirstFrame] = useState<{b64: string, mime: string} | null>(null);
    const [prompt, setPrompt] = useState('What is happening in this scene?');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideo({ url, name: file.name });
            setResult('');

            const videoEl = document.createElement('video');
            videoEl.src = url;
            videoEl.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = videoEl.videoWidth;
                canvas.height = videoEl.videoHeight;
                canvas.getContext('2d')?.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                const frameDataUrl = canvas.toDataURL('image/jpeg');
                setFirstFrame({ b64: frameDataUrl.split(',')[1], mime: 'image/jpeg' });
                URL.revokeObjectURL(url); // Clean up
            };
        }
    };

    const handleAnalyze = async () => {
        if (!firstFrame) return;
        setIsLoading(true);
        setResult('');
        const response = await analyzeImage(firstFrame.b64, firstFrame.mime, prompt);
        setResult(response);
        setIsLoading(false);
    };

    return (
        <AiToolCard title="Video Analyzer" icon={<VideoIcon />}>
            <div className="p-4 border-2 border-dashed border-white/30 rounded-lg text-center flex-grow flex flex-col justify-center">
                <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="text-cyan-600 font-semibold dark:text-cyan-400 hover:underline text-sm">
                    {video ? `Selected: ${video.name}` : 'Select a Video'}
                </button>
                {firstFrame && <img src={`data:${firstFrame.mime};base64,${firstFrame.b64}`} alt="video first frame" className="mt-4 max-h-24 mx-auto rounded-md" />}
            </div>
            <textarea 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)} 
                rows={2} 
                className="w-full p-2 border border-white/30 rounded-md mt-4 bg-white/20 dark:bg-black/20 text-sm placeholder-slate-500"
                placeholder="Enter a prompt for the first frame..."
            />
            <button 
                onClick={handleAnalyze} 
                disabled={!firstFrame || isLoading} 
                className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-sky-600 text-white p-2 rounded-md disabled:opacity-50 text-sm font-semibold btn-hover-scale"
            >
                {isLoading ? 'Analyzing...' : 'Analyze First Frame'}
            </button>
             {isLoading && <div className="text-center mt-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div></div>}
            {result && <div className="relative mt-4 p-3 bg-white/20 dark:bg-black/20 rounded-md whitespace-pre-wrap text-sm max-h-48 overflow-y-auto"><CopyButton text={result}/>{result}</div>}
        </AiToolCard>
    );
};

const AudioTranscription: React.FC = () => {
    const [audio, setAudio] = useState<{ b64: string; mime: string; name: string; url: string } | null>(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const reader = new FileReader();
            reader.onload = (readEvent) => {
                const b64 = (readEvent.target?.result as string).split(',')[1];
                setAudio({ b64, mime: file.type, name: file.name, url });
                setResult('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTranscribe = async () => {
        if (!audio) return;
        setIsLoading(true);
        setResult('');
        const response = await transcribeAudio(audio.b64, audio.mime);
        setResult(response);
        setIsLoading(false);
    };

    return (
        <AiToolCard title="Audio Transcription" icon={<AudioIcon />}>
            <div className="p-4 border-2 border-dashed border-white/30 rounded-lg text-center flex-grow flex flex-col justify-center">
                <input type="file" accept="audio/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="text-cyan-600 font-semibold dark:text-cyan-400 hover:underline text-sm">
                    {audio ? `Selected: ${audio.name}` : 'Select an Audio File'}
                </button>
                {audio && <audio src={audio.url} controls className="mt-4 w-full" />}
            </div>
            <button 
                onClick={handleTranscribe} 
                disabled={!audio || isLoading} 
                className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-sky-600 text-white p-2 rounded-md disabled:opacity-50 text-sm font-semibold btn-hover-scale"
            >
                {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
            </button>
            {isLoading && <div className="text-center mt-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div></div>}
            {result && <div className="relative mt-4 p-3 bg-white/20 dark:bg-black/20 rounded-md whitespace-pre-wrap text-sm max-h-48 overflow-y-auto"><CopyButton text={result}/>{result}</div>}
        </AiToolCard>
    );
};


const ToolLinkCard: React.FC<{ name: string; description: string; url: string; icon: React.ReactNode }> = ({ name, description, url, icon }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl rounded-lg border border-white/20 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 hover:shadow-lg transition-all group text-shadow-strong"
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-sm p-1.5 overflow-hidden">
                {icon}
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{name}</h4>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{description}</p>
    </a>
);

// --- Brand Icons ---
const GammaIcon = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="#F5F5F5"/>
        <path d="M32 44L48 32L88 32L64 52L88 72L48 72L32 60" stroke="#5D3FD3" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ClaudeIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#D97757"/>
        <path d="M30 70L50 30L70 70H30Z" fill="white"/>
    </svg>
);

const PerplexityIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#22B8CF"/>
        <path d="M50 20V80M20 50H80M29 29L71 71M29 71L71 29" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    </svg>
);

const VeedIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#000000"/>
        <path d="M30 30L50 70L70 30" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const NotionIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#000000"/>
        <path d="M30 25V75H40L60 35V75H70V25H60L40 65V25H30Z" fill="white"/>
    </svg>
);

const MidjourneyIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#FFFFFF"/>
        <path d="M20 50C20 33.4315 33.4315 20 50 20C66.5685 20 80 33.4315 80 50" stroke="#000000" strokeWidth="8" strokeLinecap="round"/>
        <path d="M20 50L40 70L60 50L80 70" stroke="#000000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ElevenLabsIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#000000"/>
        <path d="M35 25V75M65 25V75" stroke="white" strokeWidth="12" strokeLinecap="round"/>
    </svg>
);

const TomeIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#ED6C8E"/>
        <path d="M30 30H70M50 30V70" stroke="white" strokeWidth="10" strokeLinecap="round"/>
    </svg>
);

const JasperIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#6B57FF"/>
        <path d="M50 25V65C50 70.5228 45.5228 75 40 75H30" stroke="white" strokeWidth="10" strokeLinecap="round"/>
        <circle cx="50" cy="25" r="6" fill="white"/>
    </svg>
);

const FirefliesIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#1C1C1C"/>
        <circle cx="50" cy="50" r="20" fill="#FFD700"/>
        <circle cx="30" cy="30" r="5" fill="#FFD700" opacity="0.5"/>
        <circle cx="70" cy="70" r="5" fill="#FFD700" opacity="0.5"/>
    </svg>
);

const OpenAIIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#74AA9C"/>
        <path d="M50 20L75 35V65L50 80L25 65V35L50 20Z" stroke="white" strokeWidth="4"/>
        <path d="M50 20V50M75 35L50 50M75 65L50 50M50 80V50M25 65L50 50M25 35L50 50" stroke="white" strokeWidth="4"/>
    </svg>
);

const SynthesiaIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#32CD32"/>
        <path d="M40 30V70L70 50L40 30Z" fill="white"/>
    </svg>
);

const RunwayIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#000000"/>
        <path d="M35 75V25H55C66.0457 25 75 33.9543 75 45C75 56.0457 66.0457 65 55 65H35" stroke="white" strokeWidth="10"/>
        <path d="M55 65L75 85" stroke="white" strokeWidth="10" strokeLinecap="round"/>
    </svg>
);

const ZapierIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#FF4F00"/>
        <path d="M30 50H70M50 30V70" stroke="white" strokeWidth="12" strokeLinecap="round"/>
    </svg>
);

const ConsensusIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#3B82F6"/>
        <circle cx="35" cy="50" r="8" fill="white"/>
        <circle cx="65" cy="50" r="8" fill="white"/>
        <path d="M35 50H65" stroke="white" strokeWidth="4"/>
    </svg>
);

const NotebookLMIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#FFFFFF" stroke="#4285F4" strokeWidth="4"/>
        <path d="M35 30H65M35 50H65M35 70H55" stroke="#4285F4" strokeWidth="6" strokeLinecap="round"/>
    </svg>
);

const ColabIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#F9AB00"/>
        <path d="M30 50C30 38.9543 38.9543 30 50 30C61.0457 30 70 38.9543 70 50" stroke="white" strokeWidth="8" strokeLinecap="round"/>
        <path d="M70 50C70 61.0457 61.0457 70 50 70C38.9543 70 30 61.0457 30 50" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    </svg>
);

const HuggingFaceIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#FFD21E"/>
        <circle cx="35" cy="45" r="5" fill="black"/>
        <circle cx="65" cy="45" r="5" fill="black"/>
        <path d="M35 65Q50 75 65 65" stroke="black" strokeWidth="4" strokeLinecap="round"/>
        <path d="M20 40H30M70 40H80" stroke="black" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);

const KaggleIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#20BEFF"/>
        <path d="M35 25V75M35 50L65 25M35 50L65 75" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ReplicateIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#000000"/>
        <path d="M35 30H65V45H45V55H55L65 70H50L40 55H35V70H25V30H35Z" fill="white"/>
    </svg>
);

const workflowTools = [
    { name: 'Gamma.app', description: 'AI-powered tool for creating engaging presentations, documents, and webpages.', url: 'https://gamma.app/', icon: <GammaIcon /> },
    { name: 'Claude.ai', description: 'A next-generation AI assistant for your tasks, no matter the scale.', url: 'https://claude.ai/', icon: <ClaudeIcon /> },
    { name: 'Perplexity.ai', description: 'An AI search engine that provides direct, cited answers to complex questions.', url: 'https://www.perplexity.ai/', icon: <PerplexityIcon /> },
    { name: 'Veed.io', description: 'Online video suite with AI features for subtitling, editing, and content creation.', url: 'https://www.veed.io/', icon: <VeedIcon /> },
    { name: 'Notion AI', description: 'Integrate AI assistance directly into your notes, docs, and project management.', url: 'https://www.notion.so/product/ai', icon: <NotionIcon /> },
    { name: 'Midjourney', description: 'An independent research lab producing a proprietary artificial intelligence program that creates images from textual descriptions.', url: 'https://www.midjourney.com/', icon: <MidjourneyIcon /> },
    { name: 'ElevenLabs', description: 'Generate high-quality spoken audio in any voice, style, and language.', url: 'https://elevenlabs.io/', icon: <ElevenLabsIcon /> },
    { name: 'Tome', description: 'The AI-powered storytelling format for presentations and documents.', url: 'https://tome.app/', icon: <TomeIcon /> },
    { name: 'Jasper.ai', description: 'AI Content Platform that helps your team create content tailored for your brand.', url: 'https://www.jasper.ai/', icon: <JasperIcon /> },
    { name: 'Fireflies.ai', description: 'AI assistant for your meetings. Record, transcribe, and search your conversations.', url: 'https://fireflies.ai/', icon: <FirefliesIcon /> },
    { name: 'DALL-E 3', description: 'Create highly detailed images from text descriptions using OpenAI\'s advanced model.', url: 'https://openai.com/dall-e-3', icon: <OpenAIIcon /> },
    { name: 'Synthesia', description: 'Create professional videos with AI avatars and voiceovers from just text.', url: 'https://www.synthesia.io/', icon: <SynthesiaIcon /> },
    { name: 'RunwayML', description: 'An applied AI research company shaping the next era of art, entertainment and human creativity.', url: 'https://runwayml.com/', icon: <RunwayIcon /> },
    { name: 'Zapier', description: 'Automate workflows by connecting your apps and services with AI-powered triggers.', url: 'https://zapier.com/', icon: <ZapierIcon /> },
    { name: 'Consensus', description: 'An AI search engine for research papers, extracting and distilling scientific findings.', url: 'https://consensus.app/', icon: <ConsensusIcon /> },
    { name: 'NotebookLM', description: 'Google\'s AI research and writing assistant for your source materials.', url: 'https://notebooklm.google.com/', icon: <NotebookLMIcon /> },
    { name: 'Google Colab', description: 'Collaborative notebooks for AI/ML development, running in the cloud.', url: 'https://colab.research.google.com/', icon: <ColabIcon /> },
    { name: 'Hugging Face', description: 'The AI community building the future. Find models, datasets, and applications.', url: 'https://huggingface.co/', icon: <HuggingFaceIcon /> },
    { name: 'Kaggle', description: 'A community for data scientists and ML practitioners. Access datasets and notebooks.', url: 'https://www.kaggle.com/', icon: <KaggleIcon /> },
    { name: 'Replicate', description: 'Run and fine-tune open-source AI models with a cloud API.', url: 'https://replicate.com/', icon: <ReplicateIcon /> },
];

export const AiTools: React.FC = () => {
    return (
        <div className="text-shadow-strong">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">AI Tools</h2>
                <p className="text-slate-600 mt-1 dark:text-slate-300">Leverage powerful AI models for various tasks and discover tools to enhance your workflow.</p>
            </div>
            
            <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-lg border border-white/20 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">AI Media Analyzer</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ImageAnalyzer />
                    <VideoAnalyzer />
                    <AudioTranscription />
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Workflow Enhancement Tools</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1 mb-6">A curated list of external AI tools and applications to help streamline your workflow.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {workflowTools.map(tool => (
                        <ToolLinkCard key={tool.name} {...tool} />
                    ))}
                </div>
            </div>
        </div>
    );
};


const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
