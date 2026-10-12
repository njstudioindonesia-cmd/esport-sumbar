'use client';

import { useState } from 'react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Modal,
  SkeletonCard,
  SkeletonArticle,
  useToast,
  Input,
  Textarea,
} from '@/components/ui';
import { Layers, Mail, Lock } from 'lucide-react';

export default function StyleguidePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-12 space-y-16">
      {/* Page Header */}
      <div className="border-b border-line pb-6">
        <div className="flex items-center gap-2 text-xs font-display font-bold uppercase text-brand-400 tracking-widest mb-2">
          <Layers className="w-4 h-4 text-brand-500" />
          Design System & Visual Component Review
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-wider">
          ESPORT SUMBAR — Styleguide
        </h1>
        <p className="text-sm text-accent-text400 mt-2 max-w-2xl leading-relaxed">
          Katalog token visual, komponen gaming-pro berkarakter tegas, potongan sudut diagonal (*chamfer*), dan bebas dari estetika &apos;template AI generik&apos;.
        </p>
      </div>

      {/* 1. Design Tokens: Colors & Typography */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="w-2 h-5 bg-brand-500 chamfer-badge"></span>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            1. Design Tokens: Warna & Tipografi
          </h2>
        </div>

        {/* Color Palette */}
        <div>
          <h3 className="text-xs font-display font-bold uppercase text-accent-text400 tracking-wider mb-3">
            Palet Brand Red & Dark Surfaces
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            <div className="p-3 rounded bg-[#E10600] text-white space-y-1">
              <span className="text-[10px] uppercase font-mono block opacity-80">--red-500</span>
              <span className="font-mono text-xs font-bold block">#E10600</span>
              <span className="text-[10px] block opacity-90">Primary</span>
            </div>
            <div className="p-3 rounded bg-[#B80500] text-white space-y-1">
              <span className="text-[10px] uppercase font-mono block opacity-80">--red-600</span>
              <span className="font-mono text-xs font-bold block">#B80500</span>
              <span className="text-[10px] block opacity-90">Hover</span>
            </div>
            <div className="p-3 rounded bg-[#FF3B30] text-white space-y-1">
              <span className="text-[10px] uppercase font-mono block opacity-80">--red-400</span>
              <span className="font-mono text-xs font-bold block">#FF3B30</span>
              <span className="text-[10px] block opacity-90">Accent</span>
            </div>
            <div className="p-3 rounded bg-[#0B0B0D] text-white border border-line space-y-1">
              <span className="text-[10px] uppercase font-mono block text-accent-text400">--bg-900</span>
              <span className="font-mono text-xs font-bold block">#0B0B0D</span>
              <span className="text-[10px] block text-accent-text400">Base</span>
            </div>
            <div className="p-3 rounded bg-[#131316] text-white border border-line space-y-1">
              <span className="text-[10px] uppercase font-mono block text-accent-text400">--bg-800</span>
              <span className="font-mono text-xs font-bold block">#131316</span>
              <span className="text-[10px] block text-accent-text400">Surface</span>
            </div>
            <div className="p-3 rounded bg-[#1C1C21] text-white border border-line space-y-1">
              <span className="text-[10px] uppercase font-mono block text-accent-text400">--bg-700</span>
              <span className="font-mono text-xs font-bold block">#1C1C21</span>
              <span className="text-[10px] block text-accent-text400">Card</span>
            </div>
            <div className="p-3 rounded bg-[#2A2A31] text-white border border-line space-y-1">
              <span className="text-[10px] uppercase font-mono block text-accent-text400">--line</span>
              <span className="font-mono text-xs font-bold block">#2A2A31</span>
              <span className="text-[10px] block text-accent-text400">Border</span>
            </div>
            <div className="p-3 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] uppercase font-mono block opacity-80">--success</span>
              <span className="font-mono text-xs font-bold block">#22C55E</span>
              <span className="text-[10px] block opacity-90">Success</span>
            </div>
          </div>
        </div>

        {/* Typography Samples */}
        <div className="bg-dark-800 border border-line rounded-lg p-6 space-y-4">
          <h3 className="text-xs font-display font-bold uppercase text-accent-text400 tracking-wider">
            Tipografi: Display Sporty + Body Inter + Tabular Nums
          </h3>
          <div className="space-y-3">
            <div className="font-display font-black text-3xl uppercase tracking-wider text-white">
              Heading Display — Rajdhani / Barlow Condensed (700/800)
            </div>
            <div className="text-sm text-accent-text400 leading-relaxed max-w-3xl">
              Body Text — Inter (400/500/600). Teks editorial berita esport, keterangan turnamen, profil tim, dan ketentuan regulasi pertandingan. Dirancang bersih dan mudah dibaca pada layar perangkat mobile maupun desktop.
            </div>
            <div className="font-mono tabular-nums text-lg text-brand-400 font-bold">
              Tabular Score: Padang Slayers [ 02 ] - [ 01 ] Singgalang Knights (Poin Placement: 1,450 PTS)
            </div>
          </div>
        </div>
      </section>

      {/* 2. Buttons */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="w-2 h-5 bg-brand-500 chamfer-badge"></span>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            2. Button Primitives (Chamfer Cuts)
          </h2>
        </div>

        <div className="bg-dark-800 border border-line rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-display font-bold uppercase text-accent-text400">
              Varian Utama (Primary, Secondary, Outline, Danger, Ghost)
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-display font-bold uppercase text-accent-text400">
              Ukuran (Small, Medium, Large) & Status Loading
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="primary">
                Small (sm)
              </Button>
              <Button size="md" variant="primary">
                Medium (md)
              </Button>
              <Button size="lg" variant="primary">
                Large (lg)
              </Button>
              <Button variant="primary" isLoading>
                Loading State
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Badges */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="w-2 h-5 bg-brand-500 chamfer-badge"></span>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            3. Badges (Status & Kategori)
          </h2>
        </div>

        <div className="bg-dark-800 border border-line rounded-lg p-6 flex flex-wrap items-center gap-3">
          <Badge variant="brand">Brand Badge</Badge>
          <Badge variant="success">Pendaftaran Buka</Badge>
          <Badge variant="warning">Menunggu Tinjauan</Badge>
          <Badge variant="info">Nasional Scope</Badge>
          <Badge variant="neutral">Mobile Legends</Badge>
          <Badge variant="outline">Sumatera Barat</Badge>
        </div>
      </section>

      {/* 4. Cards & Ticket Format */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="w-2 h-5 bg-brand-500 chamfer-badge"></span>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            4. Cards (Chamfer Diagonal Cuts)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="brand">SUMBAR</Badge>
                <span className="text-[11px] font-mono text-accent-text400">SLOT: 64/64 TIM</span>
              </div>
              <CardTitle>Turnamen Esport Piala Padang Pride</CardTitle>
              <CardDescription>
                Auditorium Universitas Negeri Padang, Sumatera Barat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-accent-text400 leading-relaxed">
                Kompetisi bergengsi se-Kota Padang dengan sistem Double Elimination. Pertandingan disiarkan langsung melalui live streaming broadcast.
              </p>
            </CardContent>
            <CardFooter>
              <span className="font-display font-bold text-white text-sm">
                Prize: Rp 20.000.000
              </span>
              <Button size="sm" variant="primary">
                Detail Bracket
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="success">RESMI EO</Badge>
                <span className="text-[11px] font-mono text-emerald-400">TERVERIFIKASI</span>
              </div>
              <CardTitle>Bukittinggi Gaming Syndicate</CardTitle>
              <CardDescription>Event Organizer Resmi Terverifikasi</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-accent-text400 leading-relaxed">
                Penyelenggara turnamen Free Fire dan PUBG Mobile kawasan Bukittinggi dan Agam. Telah menyelenggarakan 12 event turnamen berizin resmi.
              </p>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-accent-text400">1,820 Peserta Terdaftar</span>
              <Button size="sm" variant="secondary">
                Lihat Profil EO
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 5. Tabs, Modal, Skeletons, and Toasts */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="w-2 h-5 bg-brand-500 chamfer-badge"></span>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            5. Broadcast Tabs & Interactive Controls
          </h2>
        </div>

        <div className="bg-dark-800 border border-line rounded-lg p-6 space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="diskusi">
            <TabsList>
              <TabsTrigger value="diskusi">Diskusi Komunitas</TabsTrigger>
              <TabsTrigger value="event">Event Turnamen</TabsTrigger>
              <TabsTrigger value="bracket">Live Bracket</TabsTrigger>
              <TabsTrigger value="anggota">Anggota (1,240)</TabsTrigger>
            </TabsList>
            <TabsContent value="diskusi">
              <div className="text-xs text-accent-text400">
                Konten Tab Diskusi: Menampilkan feed postingan, komentar, dan pengumuman komunitas per game.
              </div>
            </TabsContent>
            <TabsContent value="event">
              <div className="text-xs text-accent-text400">
                Konten Tab Event: Daftar turnamen yang sedang berlangsung atau yang diikuti tim komunitas.
              </div>
            </TabsContent>
            <TabsContent value="bracket">
              <div className="text-xs text-accent-text400">
                Konten Tab Bracket: Visualisasi bracket Single/Double Elimination dan klasemen poin.
              </div>
            </TabsContent>
            <TabsContent value="anggota">
              <div className="text-xs text-accent-text400">
                Konten Tab Anggota: Daftar member terverifikasi dan moderator komunitas.
              </div>
            </TabsContent>
          </Tabs>

          {/* Interactive Modal & Toasts Trigger */}
          <div className="pt-4 border-t border-line space-y-4">
            <h4 className="text-xs font-display font-bold uppercase text-accent-text400">
              Interaktif: Modal Dialog & Toast Feedback
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(true)}>
                Buka Modal Preview
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    type: 'success',
                    title: 'Berhasil Terdaftar',
                    message: 'Tim Padang Pride berhasil mendaftar turnamen!',
                  })
                }
              >
                Picu Toast Success
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    type: 'error',
                    title: 'Pendaftaran Gagal',
                    message: 'Kuota tim untuk turnamen ini sudah penuh.',
                  })
                }
              >
                Picu Toast Error
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Form Primitives */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="w-2 h-5 bg-brand-500 chamfer-badge"></span>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            6. Form Inputs & Textareas
          </h2>
        </div>

        <div className="bg-dark-800 border border-line rounded-lg p-6 max-w-xl space-y-4">
          <Input
            label="Alamat Email Pemain"
            placeholder="nama@esport.id"
            leftIcon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Password Akun (Contoh Error State)"
            type="password"
            placeholder="••••••••"
            error="Password harus mengandung minimal 1 huruf besar dan 1 angka"
            leftIcon={<Lock className="w-4 h-4" />}
          />
          <Textarea
            label="Deskripsi / Aturan Turnamen"
            placeholder="Tuliskan aturan pertandingan, syarat eliminasi, dan kontak panitia..."
            rows={3}
          />
        </div>
      </section>

      {/* 7. Skeleton Loading Previews */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <span className="w-2 h-5 bg-brand-500 chamfer-badge"></span>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            7. Skeleton Loading Placeholders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <div className="space-y-4">
            <SkeletonArticle />
            <SkeletonArticle />
          </div>
        </div>
      </section>

      {/* Modal Dialog Instance */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Formulir Pendaftaran Turnamen"
        description="Lengkapi data skuad tim Anda sebelum batas waktu pendaftaran ditutup."
      >
        <div className="space-y-4 text-xs">
          <Input label="Nama Tim Esport" placeholder="Contoh: Sumpur Pride" />
          <Input label="Nomor WhatsApp Kapten" placeholder="081234567890" />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                toast({
                  type: 'success',
                  title: 'Data Tersimpan',
                  message: 'Pendaftaran tim Anda berhasil diterima sistem.',
                });
              }}
            >
              Konfirmasi Pendaftaran
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
