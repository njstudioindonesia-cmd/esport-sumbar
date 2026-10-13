'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_ARTICLES } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { Article, ArticleStatus } from '@esport-sumbar/contracts';

export default function AdminNewsReviewPage() {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [activeTab, setActiveTab] = useState<ArticleStatus>('REVIEW');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTriggeringIngest, setIsTriggeringIngest] = useState(false);
  const { toast } = useToast();

  const filteredArticles = articles.filter((a) => a.status === activeTab);

  const reviewCount = articles.filter((a) => a.status === 'REVIEW').length;
  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;
  const rejectedCount = articles.filter((a) => a.status === 'REJECTED').length;

  const handleUpdateStatus = (id: string, newStatus: ArticleStatus) => {
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === id) {
          return {
            ...art,
            status: newStatus,
            publishedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : art.publishedAt,
            updatedAt: new Date().toISOString(),
          };
        }
        return art;
      }),
    );

    if (newStatus === 'PUBLISHED') {
      toast({
        title: 'Artikel Berhasil Dipublikasikan!',
        message: 'Artikel kini tayang di portal publik ESPORT SUMBAR.',
        type: 'success',
      });
    } else if (newStatus === 'REJECTED') {
      toast({
        title: 'Artikel Ditolak',
        message: 'Artikel dipindahkan ke arsip penolakan moderasi.',
        type: 'info',
      });
    }

    if (selectedArticle?.id === id) {
      setIsModalOpen(false);
    }
  };

  const handleTriggerIngest = async () => {
    setIsTriggeringIngest(true);
    try {
      // Simulate or call gateway ingestion
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Append sample fresh incoming article
      const newItem: Article = {
        id: `art-ingest-${Date.now()}`,
        title: `Liputan Scrim Akbar Sumbar #${Math.floor(Math.random() * 100) + 1} Selesai Digelar`,
        slug: `scrim-akbar-sumbar-${Date.now()}`,
        summary:
          'Sesi scrim gabungan antar 16 tim kualifikasi regional mencatatkan pertandingan berintensitas tinggi.',
        body: 'Seluruh peserta menunjukkan kesiapan mental dan eksekusi gameplay prima menjelang turnamen utama.',
        sourceName: 'Esports ID Regional Feed',
        sourceUrl: 'https://esports.id/feed/scrim-sumbar',
        category: 'Sumbar',
        gameId: 'Mobile Legends',
        tags: ['Sumbar', 'Scrim', 'MLBB'],
        viralScore: 89,
        status: 'REVIEW',
        aiMeta: {
          confidence: 0.95,
          provider: 'claude-3-7-sonnet',
          latencyMs: 412,
        },
        publishedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setArticles((prev) => [newItem, ...prev]);
      toast({
        title: 'Pipeline Ingestor Selesai',
        message: '1 artikel baru dari feed RSS berhasil dikurasi dan masuk antrean review.',
        type: 'success',
      });
    } catch {
      toast({
        title: 'Ingestor Gagal',
        message: 'Terjadi kendala saat menghubungi pipeline ingestor.',
        type: 'error',
      });
    } finally {
      setIsTriggeringIngest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-900)] text-[var(--text-100)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--line)] pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-[var(--warning)] inline-block"></span>
            <span className="text-xs uppercase tracking-widest font-black text-[var(--warning)]">
              Redaksi & Antrean Kurasi AI
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-display">
            Admin Review Queue
          </h1>
          <p className="text-sm text-[var(--text-400)] mt-1">
            Verifikasi artikel hasil kurasi otomatis sebelum tayang ke publik. Sesuai spec, seluruh berita
            berstatus awal <strong>REVIEW</strong> untuk menjamin akurasi dan kepatuhan norma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleTriggerIngest}
            disabled={isTriggeringIngest}
            className="text-xs"
          >
            {isTriggeringIngest ? 'Memproses Ingesti...' : '⚡ Trigger Ingestor RSS'}
          </Button>
          <Link href="/berita">
            <Button variant="outline" size="sm" className="text-xs border-[var(--line)]">
              Lihat Portal Berita →
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div
          onClick={() => setActiveTab('REVIEW')}
          className={`p-4 border cursor-pointer transition-all ${
            activeTab === 'REVIEW'
              ? 'bg-[var(--bg-800)] border-[var(--warning)] ring-1 ring-[var(--warning)]'
              : 'bg-[var(--bg-800)]/60 border-[var(--line)] hover:border-[var(--line)]/80'
          }`}
        >
          <span className="text-xs uppercase text-[var(--text-400)] font-bold block mb-1">
            Menunggu Review Redaksi
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--warning)] font-display">{reviewCount}</span>
            <span className="text-xs text-[var(--text-400)]">artikel siap dicek</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('PUBLISHED')}
          className={`p-4 border cursor-pointer transition-all ${
            activeTab === 'PUBLISHED'
              ? 'bg-[var(--bg-800)] border-[var(--success)] ring-1 ring-[var(--success)]'
              : 'bg-[var(--bg-800)]/60 border-[var(--line)] hover:border-[var(--line)]/80'
          }`}
        >
          <span className="text-xs uppercase text-[var(--text-400)] font-bold block mb-1">
            Artikel Terpublikasi
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--success)] font-display">{publishedCount}</span>
            <span className="text-xs text-[var(--text-400)]">tayang di portal</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('REJECTED')}
          className={`p-4 border cursor-pointer transition-all ${
            activeTab === 'REJECTED'
              ? 'bg-[var(--bg-800)] border-[var(--red-500)] ring-1 ring-[var(--red-500)]'
              : 'bg-[var(--bg-800)]/60 border-[var(--line)] hover:border-[var(--line)]/80'
          }`}
        >
          <span className="text-xs uppercase text-[var(--text-400)] font-bold block mb-1">
            Artikel Ditolak
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--red-400)] font-display">{rejectedCount}</span>
            <span className="text-xs text-[var(--text-400)]">gagal moderasi / ditolak</span>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[var(--line)] pb-3">
        {(['REVIEW', 'PUBLISHED', 'REJECTED'] as ArticleStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'text-white border-b-2 border-[var(--red-500)] bg-[var(--bg-800)]'
                : 'text-[var(--text-400)] hover:text-white'
            }`}
          >
            {tab} ({articles.filter((a) => a.status === tab).length})
          </button>
        ))}
      </div>

      {/* Article List Table / Cards */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-800)] border border-[var(--line)] rounded-sm">
          <p className="text-[var(--text-400)] text-sm">Tidak ada artikel dalam status {activeTab}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((art) => (
            <Card
              key={art.id}
              className="bg-[var(--bg-800)] border-[var(--line)] p-5 hover:border-[var(--line)]/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      art.status === 'PUBLISHED' ? 'success' : art.status === 'REVIEW' ? 'warning' : 'brand'
                    }
                    size="sm"
                  >
                    {art.status}
                  </Badge>
                  <span className="text-xs font-semibold text-white bg-[var(--bg-700)] px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                  <span className="text-xs text-[var(--text-400)]">
                    Sumber: <strong className="text-white">{art.sourceName}</strong>
                  </span>
                  <span className="text-xs text-[var(--warning)] font-bold">
                    🔥 Viral: {art.viralScore}
                  </span>
                  {Boolean(art.aiMeta?.confidence) && (
                    <span className="text-xs text-[var(--info)]">
                      AI Conf: {Math.round(Number(art.aiMeta?.confidence) * 100)}%
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{art.title}</h3>
                <p className="text-xs text-[var(--text-400)] line-clamp-2 max-w-3xl leading-relaxed">
                  {art.summary}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedArticle(art);
                    setIsModalOpen(true);
                  }}
                  className="text-xs border-[var(--line)]"
                >
                  Detail & Pratinjau
                </Button>

                {art.status === 'REVIEW' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(art.id, 'PUBLISHED')}
                      className="text-xs bg-[var(--success)] hover:bg-[var(--success)]/80 text-black font-bold"
                    >
                      ✓ Setujui
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(art.id, 'REJECTED')}
                      className="text-xs text-[var(--red-400)] border-[var(--red-500)]/40 hover:bg-[var(--red-500)]/20"
                    >
                      ✕ Tolak
                    </Button>
                  </>
                )}

                {art.status === 'REJECTED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(art.id, 'REVIEW')}
                    className="text-xs"
                  >
                    Kembalikan ke Review
                  </Button>
                )}

                {art.status === 'PUBLISHED' && (
                  <Link href={`/berita/${art.slug}`}>
                    <Button variant="outline" size="sm" className="text-xs text-[var(--info)] border-[var(--info)]/40">
                      Buka di Web →
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedArticle && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Pratinjau Kurasi Artikel AI"
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[var(--line)]">
              <Badge variant="brand" size="sm">
                {selectedArticle.category}
              </Badge>
              <span className="text-xs text-[var(--text-400)]">
                Sumber Asal:{' '}
                <a
                  href={selectedArticle.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--red-400)] underline"
                >
                  {selectedArticle.sourceName} ↗
                </a>
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">{selectedArticle.title}</h3>

            <div className="bg-[var(--bg-900)] p-3 border border-[var(--line)] text-xs text-[var(--text-100)] rounded">
              <span className="font-bold text-[var(--warning)] block mb-1">Ringkasan AI:</span>
              <p>{selectedArticle.summary}</p>
            </div>

            <div className="text-sm text-[var(--text-400)] leading-relaxed space-y-3 max-h-60 overflow-y-auto pr-2">
              <p>{selectedArticle.body}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
              <span className="text-xs text-[var(--text-400)]">
                Status Saat Ini: <strong className="text-white">{selectedArticle.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Tutup
                </Button>
                {selectedArticle.status === 'REVIEW' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedArticle.id, 'REJECTED')}
                      className="text-[var(--red-400)] border-[var(--red-500)]"
                    >
                      Tolak Artikel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedArticle.id, 'PUBLISHED')}
                      className="bg-[var(--success)] text-black font-bold"
                    >
                      Setujui & Publikasikan
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
