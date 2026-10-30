import { db } from '../store/db.js';

/**
 * MICROSERVICES: BURSA TRANSFER, LFT & ROSTER TIM
 * Mengelola bursa pemain Looking For Team (LFT), scouting talenta, dan susunan roster klub.
 */
export const MicroBursa = {
  name: "bursa",

  // Ambil daftar pemain yang sedang berstatus LFT
  async getLFT(query) {
    const game = (query?.game || '').toLowerCase();
    let freeAgents = db.getLFT();

    if (game && game !== 'semua' && game !== 'all') {
      freeAgents = freeAgents.filter(a => a.game.toLowerCase().includes(game));
    }

    return {
      success: true,
      statusCode: 200,
      total: freeAgents.length,
      data: freeAgents
    };
  },

  // Kirim penawaran scouting dari tim/klub ke atlet
  async submitScoutProposal(body) {
    const { athleteId, teamName, managerName, contact, offerNotes } = body || {};

    if (!athleteId || !teamName || !contact) {
      return {
        success: false,
        statusCode: 400,
        message: "ID Atlet, Nama Tim, dan Kontak PIC wajib diisi untuk mengajukan penawaran scouting."
      };
    }

    const athlete = db.getAthleteByIdOrPaspor(athleteId);
    if (!athlete) {
      return {
        success: false,
        statusCode: 404,
        message: "Atlet tidak ditemukan."
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: `Tawaran scouting resmi dari '${teamName}' telah diteruskan ke agen & kontak atlet ${athlete.nama} (${athlete.ign}).`,
      proposalId: `sct-${Date.now().toString(36)}`
    };
  },

  // Ambil data tim terakreditasi & susunan roster
  async getTeams(query) {
    const teamId = query?.id;
    if (teamId) {
      const team = db.getTeamById(teamId);
      if (!team) {
        return { success: false, statusCode: 404, message: "Tim tidak ditemukan." };
      }
      return { success: true, statusCode: 200, data: team };
    }

    const teams = db.getTeams();
    return {
      success: true,
      statusCode: 200,
      total: teams.length,
      data: teams
    };
  }
};
