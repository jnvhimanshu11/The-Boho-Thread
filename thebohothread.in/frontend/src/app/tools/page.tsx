'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, FileText, BookOpen, PenTool, Send, Loader2, Upload, X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi } from '@/lib/ai-api';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

type ToolId = 'doubt-solver' | 'summarizer' | 'homework' | 'essay';

const TOOLS = [
  { id: 'doubt-solver' as ToolId, label: 'AI Doubt Solver', icon: MessageCircle, color: 'from-blue-500 to-indigo-600', desc: 'Ask any question and get instant answers' },
  { id: 'summarizer' as ToolId, label: 'Notes Summarizer', icon: FileText, color: 'from-purple-500 to-pink-600', desc: 'Summarize long notes in seconds' },
  { id: 'homework' as ToolId, label: 'Homework Helper', icon: BookOpen, color: 'from-orange-500 to-red-500', desc: 'Step-by-step homework solutions' },
  { id: 'essay' as ToolId, label: 'Essay Writer', icon: PenTool, color: 'from-green-500 to-teal-500', desc: 'Write structured essays on any topic' },
];

export default function AIToolsPage() {
  const params = useSearchParams();
  const [activeTool, setActiveTool] = useState<ToolId>((params.get('tool') as ToolId) || 'doubt-solver');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Doubt solver state
  const [question, setQuestion] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Summarizer state
  const [noteText, setNoteText] = useState('');

  // Homework state
  const [hwSubject, setHwSubject] = useState('');
  const [hwQuestion, setHwQuestion] = useState('');

  // Essay state
  const [essayTopic, setEssayTopic] = useState('');
  const [essayWords, setEssayWords] = useState(300);
  const [essayStyle, setEssayStyle] = useState('academic');

  const fileRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setImageFile(file || null);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    setLoading(true);
    setResult('');
    try {
      let res;
      if (activeTool === 'doubt-solver') {
        if (!question.trim()) { toast.error('Please enter a question'); return; }
        const imageBase64 = imageFile ? await fileToBase64(imageFile) : undefined;
        res = await aiApi.solveDoubt(question, imageBase64);
        setResult(res.data?.answer ?? '');
      } else if (activeTool === 'summarizer') {
        if (!noteText.trim()) { toast.error('Please paste some notes'); return; }
        res = await aiApi.summarizeNotes(noteText);
        setResult(res.data?.summary ?? '');
      } else if (activeTool === 'homework') {
        if (!hwQuestion.trim()) { toast.error('Please enter your question'); return; }
        res = await aiApi.homeworkHelper(hwSubject, hwQuestion);
        setResult(`**Answer:** ${res.data?.answer}\n\n**Explanation:** ${res.data?.explanation}`);
      } else if (activeTool === 'essay') {
        if (!essayTopic.trim()) { toast.error('Please enter an essay topic'); return; }
        res = await aiApi.essayWriter(essayTopic, essayWords, essayStyle);
        setResult(res.data?.essay ?? '');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'AI service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeMeta = TOOLS.find(t => t.id === activeTool)!;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">🤖 AI Study Tools</h1>
        <p className="text-slate-500 text-sm mt-0.5">AI-powered tools to supercharge your studying</p>
      </div>

      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Tool Selector */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id); setResult(''); }}
              className={cn(
                'card p-4 text-left transition-all hover:shadow-md',
                activeTool === tool.id && 'ring-2 ring-primary-500 shadow-md -translate-y-0.5'
              )}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{tool.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{tool.desc}</p>
            </button>
          ))}
        </div>

        {/* Tool Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="card p-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium bg-gradient-to-r ${activeMeta.color} mb-5`}>
              <activeMeta.icon className="w-4 h-4" />
              {activeMeta.label}
            </div>

            {activeTool === 'doubt-solver' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Your Question</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="input-field min-h-[140px] resize-none"
                    placeholder="Type your doubt here... e.g., 'Explain Newton's third law with examples'"
                  />
                </div>
                <div>
                  <label className="label">Upload Image (optional)</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center cursor-pointer hover:border-primary-400 transition-colors"
                  >
                    {imageFile ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{imageFile.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setImageFile(null); }} className="text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="text-slate-400">
                        <Upload className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-sm">Click to upload question image</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                </div>
              </div>
            )}

            {activeTool === 'summarizer' && (
              <div>
                <label className="label">Paste Your Notes</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="input-field min-h-[240px] resize-none"
                  placeholder="Paste your chapter notes here... The AI will create a concise summary for revision."
                />
                <p className="text-xs text-slate-400 mt-1">{noteText.split(' ').filter(Boolean).length} words</p>
              </div>
            )}

            {activeTool === 'homework' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Subject</label>
                  <input
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Mathematics, Science, English..."
                  />
                </div>
                <div>
                  <label className="label">Your Question</label>
                  <textarea
                    value={hwQuestion}
                    onChange={(e) => setHwQuestion(e.target.value)}
                    className="input-field min-h-[160px] resize-none"
                    placeholder="Paste your homework question here..."
                  />
                </div>
              </div>
            )}

            {activeTool === 'essay' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Essay Topic</label>
                  <input
                    value={essayTopic}
                    onChange={(e) => setEssayTopic(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Climate change and its impact on agriculture"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Word Count</label>
                    <select value={essayWords} onChange={(e) => setEssayWords(Number(e.target.value))} className="input-field">
                      <option value={200}>200 words</option>
                      <option value={300}>300 words</option>
                      <option value={500}>500 words</option>
                      <option value={800}>800 words</option>
                      <option value={1000}>1000 words</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Style</label>
                    <select value={essayStyle} onChange={(e) => setEssayStyle(e.target.value)} className="input-field">
                      <option value="academic">Academic</option>
                      <option value="descriptive">Descriptive</option>
                      <option value="argumentative">Argumentative</option>
                      <option value="narrative">Narrative</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full mt-5 py-3 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> AI is thinking...</>
              ) : (
                <><Send className="w-5 h-5" /> Generate Answer</>
              )}
            </button>
          </div>

          {/* Output */}
          <div className="card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-slate-900 dark:text-white">AI Response</h3>
              {result && (
                <button onClick={handleCopy} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
                  {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <activeMeta.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">AI is generating your answer...</p>
                </div>
              </div>
            ) : result ? (
              <div className="flex-1 overflow-y-auto prose dark:prose-invert max-w-none text-sm scrollbar-thin">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${activeMeta.color} opacity-20 flex items-center justify-center mx-auto mb-4`}>
                    <activeMeta.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-slate-400 text-sm">Your AI response will appear here</p>
                  <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Fill in the details and click Generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
