'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Globe,
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useKnowledge } from '@/hooks/use-knowledge';
import { useToast } from '@/hooks/use-toast';
import { cn, formatDate } from '@/lib/utils';
import { FILE_UPLOAD, BRAND } from '@/lib/constants';
import type { KnowledgeBase } from '@/types';

export default function KnowledgeSetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    knowledgeBases,
    stats,
    loading,
    uploadWebsite,
    uploadDocument,
    deleteKnowledgeBase,
    hasReadyKnowledgeBase,
    hasProcessingKnowledgeBase,
    refresh,
  } = useKnowledge();

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleWebsiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;

    // Basic URL validation
    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a URL starting with http:// or https://',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      await uploadWebsite(websiteUrl);
      toast({
        title: 'Website Submitted',
        description: 'Your website is being scraped and indexed. This may take a few minutes.',
      });
      setWebsiteUrl('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit website',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      // Validate file extension
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!FILE_UPLOAD.allowedTypes.includes(ext)) {
        toast({
          title: 'Invalid File Type',
          description: `${file.name} is not supported. Allowed: ${FILE_UPLOAD.allowedTypes.join(', ')}`,
          variant: 'destructive',
        });
        continue;
      }

      // Validate file size
      if (file.size > FILE_UPLOAD.maxSize) {
        toast({
          title: 'File Too Large',
          description: `${file.name} exceeds the 10MB limit.`,
          variant: 'destructive',
        });
        continue;
      }

      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        
        // Simulate progress
        const interval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90),
          }));
        }, 200);

        await uploadDocument(file);
        
        clearInterval(interval);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

        toast({
          title: 'Document Uploaded',
          description: `${file.name} is being processed.`,
        });

        // Clean up progress after a delay
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 2000);
      } catch (error) {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
        toast({
          title: 'Upload Failed',
          description: error instanceof Error ? error.message : `Failed to upload ${file.name}`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = async (kb: KnowledgeBase) => {
    try {
      setDeleting(kb.id);
      await deleteKnowledgeBase(kb.id);
      toast({
        title: 'Deleted',
        description: `${kb.source_title} has been removed.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete knowledge base.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Ready
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">{BRAND.name}</span>
          </div>
          {hasProcessingKnowledgeBase && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Processing...
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Build Your Knowledge Base
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Add your website or documents so the AI can answer questions about your business accurately.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-sm text-muted-foreground">Channels</span>
          </div>
          <div className="w-8 sm:w-12 h-px bg-emerald-300" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="text-sm font-medium">Knowledge</span>
          </div>
          <div className="w-8 sm:w-12 h-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </div>
        </div>

        {/* Upload Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 animate-slideUp">
          {/* Website URL */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Website URL</CardTitle>
                  <CardDescription>Scrape and index your website content</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWebsiteSubmit} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button type="submit" disabled={uploading || !websiteUrl.trim()}>
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Add'
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                We'll crawl up to 50 pages from your website.
              </p>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Upload Documents</CardTitle>
                  <CardDescription>PDF, DOCX, TXT files up to 10MB</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <label
                className={cn(
                  'flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer',
                  'hover:bg-slate-50 transition-colors',
                  'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag & drop
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept={FILE_UPLOAD.allowedTypes.join(',')}
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>

              {/* Upload Progress */}
              {Object.entries(uploadProgress).length > 0 && (
                <div className="mt-4 space-y-2">
                  {Object.entries(uploadProgress).map(([filename, progress]) => (
                    <div key={filename} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="truncate max-w-[200px]">{filename}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        )}

        {/* Knowledge Sources List */}
        {!loading && knowledgeBases.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Knowledge Sources</CardTitle>
                <div className="flex items-center gap-2">
                  {stats && (
                    <Badge variant="outline">
                      {stats.total_chunks} chunks indexed
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {knowledgeBases.map((kb) => (
                  <div
                    key={kb.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {kb.source_type === 'website' ? (
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{kb.source_title}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDate(kb.created_at)}
                          {(kb.chunk_count || kb.total_chunks) ? ` • ${kb.chunk_count || kb.total_chunks} chunks` : ''}
                        </p>
                        {kb.error_message && (
                          <p className="text-xs text-red-500 mt-1">{kb.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {getStatusBadge(kb.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(kb)}
                        disabled={deleting === kb.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        {deleting === kb.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && knowledgeBases.length === 0 && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">No knowledge sources yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add a website or upload documents to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Notice */}
        {hasProcessingKnowledgeBase && (
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">
                Processing your knowledge sources...
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              This may take a few minutes. The page will automatically update when complete.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/channels')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Channels
          </Button>
          <Button
            disabled={!hasReadyKnowledgeBase}
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {!hasReadyKnowledgeBase && knowledgeBases.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Wait for at least one knowledge source to finish processing
          </p>
        )}

        {knowledgeBases.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Add at least one knowledge source to continue
          </p>
        )}
      </main>
    </div>
  );
}

