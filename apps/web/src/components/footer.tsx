export function Footer() {
  return (
    <footer className="border-t border-[#2A2A38] bg-[#08080A] mt-auto py-12 text-sm relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-1 bg-gradient-to-r from-transparent via-[#F5B700]/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display font-black text-lg text-white">
              ESPORT <span className="text-[#F5B700]">SUMBAR</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F5B700]/15 text-[#F5B700] border border-[#F5B700]/30">
              Ranah Minang
            </span>
          </div>
          <p className="text-accent-text400 text-xs max-w-sm leading-relaxed">
            Pusat turnamen, ekosistem atlet, liputan berita AI, dan komunitas kompetitif di 19 kota & kabupaten Sumatera Barat.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-xs text-accent-text400 font-mono">
          <span className="hover:text-[#F5B700] transition-colors">Padang</span>
          <span>•</span>
          <span className="hover:text-[#F5B700] transition-colors">Bukittinggi</span>
          <span>•</span>
          <span className="hover:text-[#F5B700] transition-colors">Payakumbuh</span>
          <span>•</span>
          <span className="hover:text-[#F5B700] transition-colors">Solok</span>
          <span>•</span>
          <span className="hover:text-[#F5B700] transition-colors">Pariaman</span>
          <span>•</span>
          <span className="text-[#F5B700] font-bold">+14 Wilayah Lainnya</span>
        </div>

        <div className="text-xs text-accent-text400 text-center md:text-right">
          <div>© {new Date().getFullYear()} ESPORT SUMBAR. All rights reserved.</div>
          <div className="text-[10px] text-[#686878] mt-0.5">Marawa Modern · Ranah Minang Cyber Edition</div>
        </div>
      </div>
    </footer>
  );
}
