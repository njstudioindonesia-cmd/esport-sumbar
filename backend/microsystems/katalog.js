import { db } from '../store/db.js';

/**
 * MICROSERVICES: KATALOG EKOSISTEM
 * Menyediakan data kartu ekosistem resmi (atlet, tim, venue).
 */
export const MicroKatalog = {
  name: "katalog",

  async getList(query) {
    const category = (query?.kategori || query?.category || 'semua').toLowerCase();
    const gameFilter = (query?.game || 'semua').toLowerCase();
    const regionFilter = (query?.wilayah || 'semua').toLowerCase();

    let athletes = db.getAthletes();
    let teams = db.getTeams();
    let venues = db.getVenues();

    // Filter game
    if (gameFilter !== 'semua' && gameFilter !== 'all') {
      athletes = athletes.filter(a => a.game && a.game.toLowerCase().includes(gameFilter));
      teams = teams.filter(t => t.game && t.game.some(g => g.toLowerCase().includes(gameFilter)));
    }

    // Filter wilayah
    if (regionFilter !== 'semua' && regionFilter !== 'all') {
      athletes = athletes.filter(a => a.wilayah && a.wilayah.toLowerCase().includes(regionFilter));
      teams = teams.filter(t => t.wilayah && t.wilayah.toLowerCase().includes(regionFilter));
      venues = venues.filter(v => v.wilayah && v.wilayah.toLowerCase().includes(regionFilter));
    }

    let items = [];
    if (category === 'semua' || category === 'all') {
      items = [
        ...athletes.map(a => ({ type: 'atlet', ...a })),
        ...teams.map(t => ({ type: 'team', ...t })),
        ...venues.map(v => ({ type: 'venue', ...v }))
      ];
    } else if (category === 'atlet' || category === 'player') {
      items = athletes.map(a => ({ type: 'atlet', ...a }));
    } else if (category === 'team' || category === 'tim') {
      items = teams.map(t => ({ type: 'team', ...t }));
    } else if (category === 'venue') {
      items = venues.map(v => ({ type: 'venue', ...v }));
    }

    return {
      success: true,
      statusCode: 200,
      totalCount: items.length,
      filters: { category, game: gameFilter, wilayah: regionFilter },
      data: items
    };
  }
};
