'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { InstagramIcon } from '@/components/icons';
import { MOCK_ARTICLES } from '../../lib/mock-data';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/form';
import { useToast } from '../../components/ui/toast';
import { Article } from '@esport-sumbar/contracts';

const CATEGORIES = ['Semua', 'Sumbar', 'Nasional', 'Dunia'];
const SOURCES = ['Semua Sumber', 'Instagram @esportsumbar', 'Media Partner / RSS'];
const GAMES = ['Semua Game', 'Mobile Legends', 'Free Fire', 'Valorant', 'PUBG Mobile'];

export default function BeritaPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedSource, setSelectedSource] = useState('Semua Sumber');
  const [selectedGame, setSelectedGame] = useState('Semua Game');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const publishedArticles = useMemo(() => {
    return MOCK_ARTICLES.filter((a) => a.status === 'PUBLISHED');
  }, []);

  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((article) => {
      const matchCat =
        selectedCategory === 'Semua' ||
        article.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchSource =
        selectedSource === 'Semua Sumber' ||
        (selectedSource === 'Instagram @esportsumbar'
          ? article.sourceType === 'INSTAGRAM' || article.sourceName.toLowerCase().includes('instagram')
          : article.sourceType !== 'INSTAGRAM' && !article.sourceName.toLowerCase().includes('instagram'));

      const matchGame =
        selectedGame === 'Semua Game' ||
        (article.gameId &&
          article.gameId.toLowerCase().includes(selectedGame.toLowerCase().replace(/\s+/g, '-'))) ||
        article.tags.some((t) => t.toLowerCase().includes(selectedGame.toLowerCase()));

      const matchSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchSource && matchGame && matchSearch;
    });
  }, [publishedArticles, selectedCategory, selectedSource, selectedGame, searchQuery]);

  const headline = filteredArticles[0] || publishedArticles[0];
  const listArticles = headline
    ? filteredArticles.filter((a) => a.id !== headline.id)
    : filteredArticles;

  const trendingArticles = useMemo(() => {
    return [...publishedArticles].sort((a, b) => b.viralScore - a.viralScore).slice(0, 4);
  }, [publishedArticles]);

  const handleToggleBookmark = (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();
    const isBookmarked = bookmarkedIds.has(article.id);
    const updated = new Set(bookmarkedIds);
    if (isBookmarked) {
      updated.delete(article.id);
      setBookmarkedIds(updated);
      toast({
        title: 'Bookmark Dihapus',
        message: `Artikel "${article.title.slice(0, 30)}..." dihapus dari simpanan`,
        type: 'info',
      });
    } else {
      updated.add(article.id);
      setBookmarkedIds(updated);
      toast({
        title: 'Artikel Disimpan',
        message: `Artikel tersimpan di bookmark profil Anda`,
        type: 'success',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-900)] text-[var(--text-100)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--line)] pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-[var(--red-500)] inline-block"></span>
            <span className="text-xs uppercase tracking-widest font-black text-[var(--red-400)]">
              Portal Berita & Kurasi AI
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-display">
            Warta Esport Ranah Minang
          </h1>
          <p className="text-sm text-[var(--text-400)] mt-1 max-w-2xl">
            Liputan turnamen, pergerakan komunitas daerah, analisis meta, dan berita internasional yang
            dikurasi cerdas dengan akurasi dan atribusi orisinalitas ketat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3002/berita"
            className="text-xs px-3 py-1.5 rounded border border-[#2A2A38] hover:border-[#F5B700] text-[#9A9AA5] hover:text-[#F5B700] transition-colors"
          >
            Review Redaksi Admin →
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--bg-800)] border border-[var(--line)] p-4 rounded-sm mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-[var(--text-400)] mr-2">Wilayah:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors chamfer-cut-sm ${
                  selectedCategory === cat
                    ? 'bg-[#F5B700] text-black font-black shadow-md shadow-[#F5B700]/20'
                    : 'bg-[var(--bg-700)] text-[var(--text-400)] hover:text-white hover:bg-[var(--line)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full lg:w-72">
            <Input
              placeholder="Cari judul, tim, atau tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--bg-900)] border-[var(--line)] text-xs py-1.5"
            />
          </div>
        </div>

        {/* Source Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--line)]">
          <span className="text-xs font-bold uppercase text-[var(--text-400)] mr-2">Sumber:</span>
          {SOURCES.map((source) => (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all flex items-center gap-1.5 ${
                selectedSource === source
                  ? 'bg-[#F5B700] text-black font-extrabold shadow-md'
                  : 'text-[var(--text-400)] hover:text-white bg-[var(--bg-900)]/60 border border-transparent'
              }`}
            >
              {source.includes('Instagram') && <InstagramIcon className="w-3 h-3 text-purple-400" />}
              {source}
            </button>
          ))}
        </div>

        {/* Game Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--line)]">
          <span className="text-xs font-bold uppercase text-[var(--text-400)] mr-2">Game:</span>
          {GAMES.map((game) => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
                selectedGame === game
                  ? 'bg-[var(--line)] text-white border border-[var(--red-500)] font-bold'
                  : 'text-[var(--text-400)] hover:text-white bg-[var(--bg-900)]/60 border border-transparent'
              }`}
            >
              {game}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Headline */}
          {headline && (
            <div className="relative group">
              <Card
                chamfer
                className="bg-[var(--bg-800)] border-[var(--line)] hover:border-[var(--red-500)]/80 transition-all overflow-hidden p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" size="sm">
                      {headline.category}
                    </Badge>
                    <span className="text-xs text-[var(--text-400)]">
                      {new Date(headline.publishedAt || headline.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-xs text-[var(--text-400)]">• 3 mnt baca</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--warning)] flex items-center gap-1">
                      🔥 Skor Viral: {headline.viralScore}
                    </span>
                    <button
                      onClick={(e) => handleToggleBookmark(e, headline)}
                      aria-label="Bookmark article"
                      className={`p-1 text-sm rounded ${
                        bookmarkedIds.has(headline.id) ? 'text-[var(--red-400)]' : 'text-[var(--text-400)] hover:text-white'
                      }`}
                    >
                      {bookmarkedIds.has(headline.id) ? '★' : '☆'}
                    </button>
                  </div>
                </div>

                <Link href={`/berita/${headline.slug}`}>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-[var(--red-400)] transition-colors leading-tight mb-3">
                    {headline.title}
                  </h2>
                </Link>

                <p className="text-sm text-[var(--text-400)] line-clamp-3 mb-4 leading-relaxed">
                  {headline.summary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--line)] text-xs text-[var(--text-400)]">
                  <div className="flex items-center gap-2">
                    <span>Sumber Orisinal:</span>
                    <span className="font-semibold text-white">{headline.sourceName}</span>
                  </div>

                  <Link href={`/berita/${headline.slug}`} className="text-[var(--red-400)] font-bold hover:underline">
                    Baca Ulasan Lengkap →
                  </Link>
                </div>
              </Card>
            </div>
          )}

          {/* Regular Article Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-white border-l-2 border-[var(--red-500)] pl-3">
              Koleksi Berita Lainnya ({listArticles.length})
            </h3>

            {listArticles.length === 0 ? (
              <div className="p-8 text-center bg-[var(--bg-800)] border border-[var(--line)]">
                <p className="text-[var(--text-400)] text-sm">Tidak ada artikel yang cocok dengan filter yang dipilih.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="bg-[var(--bg-800)] border-[var(--line)] hover:border-[var(--line)]/80 flex flex-col justify-between p-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="neutral" size="sm">
                            {article.category}
                          </Badge>
                          {article.sourceType === 'INSTAGRAM' && (
                            <Badge variant="marawa" size="sm" className="flex items-center gap-1">
                              <InstagramIcon className="w-2.5 h-2.5 text-purple-400" />
                              IG
                            </Badge>
                          )}
                          <span className="text-[10px] text-[var(--text-400)]">
                            {new Date(article.publishedAt || article.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleToggleBookmark(e, article)}
                          className={`text-sm ${
                            bookmarkedIds.has(article.id) ? 'text-[var(--red-400)]' : 'text-[var(--text-400)] hover:text-white'
                          }`}
                        >
                          {bookmarkedIds.has(article.id) ? '★' : '☆'}
                        </button>
                      </div>

                      <Link href={`/berita/${article.slug}`}>
                        <h4 className="text-base font-bold text-white group-hover:text-[var(--red-400)] transition-colors line-clamp-2 mb-2">
                          {article.title}
                        </h4>
                      </Link>

                      <p className="text-xs text-[var(--text-400)] line-clamp-2 mb-3">
                        {article.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--text-400)]">
                      <span className="flex items-center gap-1">
                        {article.sourceName}
                        {article.igPermalink && (
                          <a
                            href={article.igPermalink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#F5B700] hover:underline inline-flex items-center ml-1"
                            title="Buka postingan asli di Instagram"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </span>
                      <span className="text-[var(--warning)] font-semibold">🔥 {article.viralScore}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* Trending Panel */}
          <div className="bg-[var(--bg-800)] border border-[var(--line)] p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--line)]">
              <span className="text-base font-bold uppercase text-white font-display">
                ⚡ Top Berita Trending
              </span>
            </div>

            <div className="space-y-4">
              {trendingArticles.map((art, idx) => (
                <div key={art.id} className="flex items-start gap-3 group">
                  <span className="text-2xl font-black text-[var(--line)] group-hover:text-[var(--red-500)] transition-colors font-display w-6">
                    0{idx + 1}
                  </span>
                  <div className="flex-1">
                    <Link href={`/berita/${art.slug}`}>
                      <h5 className="text-xs font-bold text-white group-hover:text-[var(--red-400)] transition-colors line-clamp-2">
                        {art.title}
                      </h5>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--text-400)]">
                      <span>{art.category}</span>
                      <span>•</span>
                      <span className="text-[var(--warning)] font-semibold">Viral: {art.viralScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Curator Transparency Card */}
          <div className="bg-[var(--bg-800)] border border-[var(--line)] p-5 chamfer-cut-sm">
            <h4 className="text-xs font-extrabold uppercase text-[var(--red-400)] tracking-wider mb-2">
              Prinsip Kurasi Berita AI
            </h4>
            <p className="text-xs text-[var(--text-400)] leading-relaxed mb-3">
              Semua konten diproses melalui pipeline verifikasi orisinalitas, audit anti-clickbait,
              dan penyaringan moderasi toxic. Hak cipta & atribusi sumber asal selalu dicantumkan secara penuh.
            </p>
            <div className="text-[11px] bg-[var(--bg-900)] p-2.5 rounded border border-[var(--line)] text-[var(--text-100)] flex items-center justify-between">
              <span>Status Pipeline:</span>
              <span className="text-[var(--success)] font-bold">● Aktif (REVIEW FIRST)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
