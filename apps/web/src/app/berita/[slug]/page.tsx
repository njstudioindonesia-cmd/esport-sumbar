'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MOCK_ARTICLES } from '../../../lib/mock-data';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { useToast } from '../../../components/ui/toast';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const article = MOCK_ARTICLES.find((a) => a.slug === slug) || MOCK_ARTICLES[0];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Tautan Disalin!',
        message: 'Tautan artikel telah disalin ke papan klip.',
        type: 'success',
      });
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: !isBookmarked ? 'Artikel Disimpan' : 'Bookmark Dihapus',
      message: !isBookmarked
        ? 'Artikel berhasil disimpan ke daftar bacaan Anda.'
        : 'Artikel dihapus dari daftar bacaan.',
      type: !isBookmarked ? 'success' : 'info',
    });
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-[var(--bg-900)] text-white py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Artikel Tidak Ditemukan</h2>
        <Link href="/berita">
          <Button variant="primary">Kembali ke Berita</Button>
        </Link>
      </div>
    );
  }

  const relatedArticles = MOCK_ARTICLES.filter(
    (a) => a.slug !== article.slug && a.status === 'PUBLISHED',
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--bg-900)] text-[var(--text-100)] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-400)] mb-6">
        <Link href="/" className="hover:text-white transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/berita" className="hover:text-white transition-colors">
          Berita
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand" size="sm">
            {article.category}
          </Badge>
          {article.gameId && (
            <Badge variant="neutral" size="sm">
              {article.gameId}
            </Badge>
          )}
          <span className="text-xs text-[var(--text-400)]">
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span className="text-xs text-[var(--text-400)]">• 4 menit baca</span>
          <span className="text-xs font-semibold text-[var(--warning)] ml-auto">
            🔥 Skor Viral: {article.viralScore}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display leading-tight">
          {article.title}
        </h1>

        {/* Action Bar (Share & Bookmark) */}
        <div className="flex items-center justify-between py-3 border-y border-[var(--line)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-400)]">
            <span>Kurasi Redaksi ESPORT SUMBAR</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleBookmark}
              className={`text-xs ${isBookmarked ? 'border-[var(--red-500)] text-[var(--red-400)]' : ''}`}
            >
              {isBookmarked ? '★ Tersimpan' : '☆ Simpan'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="text-xs">
              ↗ Bagikan
            </Button>
          </div>
        </div>
      </header>

      {/* Mandatory Attribution Notice (Anti AI Plagiarism Rule) */}
      <div className="bg-[var(--bg-800)] border-l-4 border-[var(--red-500)] p-4 rounded-sm mb-8 text-xs text-[var(--text-400)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-bold text-white uppercase tracking-wide block mb-0.5">
            Atribusi Sumber Orisinal Resmi
          </span>
          <span>
            Artikel ini dievaluasi & dirangkum cerdas dari sumber:{' '}
            <strong className="text-white">{article.sourceName}</strong>
          </span>
        </div>
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--red-400)] font-bold hover:underline shrink-0"
        >
          Kunjungi Berita Asli ↗
        </a>
      </div>

      {/* Article Lead Summary */}
      <div className="text-lg font-semibold text-white/90 leading-relaxed mb-6 bg-[var(--bg-800)]/40 p-4 border border-[var(--line)]/60">
        {article.summary}
      </div>

      {/* Article Body */}
      <article className="prose prose-invert max-w-none text-base text-[var(--text-100)] leading-relaxed space-y-6 mb-8">
        <p>{article.body}</p>
        <p>
          Perkembangan esport di Sumatera Barat menunjukkan kurva eksponensial dalam dua tahun terakhir.
          Dengan adanya platform terpadu yang memfasilitasi rekaman statistik, bracket turnamen terverifikasi,
          serta keterlibatan komunitas grassroots, ekosistem kompetitif lokal kian diakui di level nasional.
        </p>
        <p>
          Asosiasi dan promotor turnamen mengajak seluruh pegiat esport dan tim komunitas untuk terus
          menjunjung tinggi sportivitas, anti-toxic, dan integritas kompetitif demi memajukan talenta muda Ranah Minang.
        </p>
      </article>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-[var(--line)] mb-12">
        <span className="text-xs font-bold uppercase text-[var(--text-400)] mr-2">Topik Terkait:</span>
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 text-xs bg-[var(--bg-800)] text-[var(--text-400)] border border-[var(--line)] rounded-sm"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Related News Section */}
      <section className="border-t border-[var(--line)] pt-8 space-y-4">
        <h3 className="text-lg font-bold uppercase tracking-wider text-white border-l-2 border-[var(--red-500)] pl-3">
          Berita Terkait Lainnya
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedArticles.map((rel) => (
            <Card
              key={rel.id}
              className="bg-[var(--bg-800)] border-[var(--line)] p-4 hover:border-[var(--line)]/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] text-[var(--text-400)] block mb-1">{rel.category}</span>
                <Link href={`/berita/${rel.slug}`}>
                  <h4 className="text-sm font-bold text-white hover:text-[var(--red-400)] transition-colors line-clamp-2 mb-2">
                    {rel.title}
                  </h4>
                </Link>
              </div>
              <span className="text-[11px] text-[var(--text-400)]">{rel.sourceName}</span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
