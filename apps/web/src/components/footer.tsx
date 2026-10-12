export function Footer() {
  return (
    <footer className="border-t border-line bg-dark-900 mt-auto py-10 text-sm">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display font-black text-lg text-white">
              ESPORT <span className="text-brand-500">SUMBAR</span>
            </span>
          </div>
          <p className="text-accent-text400 text-xs max-w-sm leading-relaxed">
            Pusat berita AI terkurasi, forum komunitas per game, dan platform turnamen esport Sumatera Barat.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-accent-text400">
          <span>Padang</span>
          <span>•</span>
          <span>Bukittinggi</span>
          <span>•</span>
          <span>Payakumbuh</span>
          <span>•</span>
          <span>Solok</span>
          <span>•</span>
          <span>Pariaman</span>
        </div>

        <div className="text-xs text-accent-text400">
          © {new Date().getFullYear()} ESPORT SUMBAR. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
