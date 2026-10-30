import { db } from '../store/db.js';

/**
 * MICROSERVICES: SEARCH & DISCOVERY ENGINE
 * Pencarian cepat multi-entitas berbasis teks, game, wilayah, dan kategori.
 */
export const MicroSearch = {
  name: "search",

  async query(params) {
    const keyword = (params?.q || params?.keyword || '').trim().toLowerCase();
    const region = (params?.wilayah || '').trim().toLowerCase();
    const game = (params?.game || '').trim().toLowerCase();

    const athletes = db.getAthletes();
    const teams = db.getTeams();
    const venues = db.getVenues();
    const districts = db.getWilayahList();

    const results = {
      atlet: [],
      tim: [],
      venue: [],
      wilayah: []
    };

    // Filter athletes
    results.atlet = athletes.filter(a => {
      const matchKey = !keyword || 
        a.nama.toLowerCase().includes(keyword) || 
        (a.ign && a.ign.toLowerCase().includes(keyword)) ||
        (a.role && a.role.toLowerCase().includes(keyword));
      const matchRegion = !region || region === 'semua' || a.wilayah.toLowerCase().includes(region);
      const matchGame = !game || game === 'semua' || a.game.toLowerCase().includes(game);
      return matchKey && matchRegion && matchGame;
    });

    // Filter teams
    results.tim = teams.filter(t => {
      const matchKey = !keyword || 
        t.nama.toLowerCase().includes(keyword) || 
        (t.kapten && t.kapten.toLowerCase().includes(keyword));
      const matchRegion = !region || region === 'semua' || t.wilayah.toLowerCase().includes(region);
      const matchGame = !game || game === 'semua' || t.game.some(g => g.toLowerCase().includes(game));
      return matchKey && matchRegion && matchGame;
    });

    // Filter venues
    results.venue = venues.filter(v => {
      const matchKey = !keyword || 
        v.nama.toLowerCase().includes(keyword) || 
        (v.alamat && v.alamat.toLowerCase().includes(keyword));
      const matchRegion = !region || region === 'semua' || v.wilayah.toLowerCase().includes(region);
      return matchKey && matchRegion;
    });

    // Filter districts
    if (keyword) {
      results.wilayah = districts.filter(w => 
        w.nama.toLowerCase().includes(keyword) || 
        w.ketua.toLowerCase().includes(keyword)
      );
    }

    const totalMatches = 
      results.atlet.length + 
      results.tim.length + 
      results.venue.length + 
      results.wilayah.length;

    return {
      success: true,
      statusCode: 200,
      query: { keyword, region, game },
      totalMatches,
      data: results
    };
  }
};
