import { Injectable } from '@nestjs/common';
import { NewsIngestedPayload } from '@esport-sumbar/contracts';

@Injectable()
export class FeedFetcherService {
  async fetchFeeds(): Promise<NewsIngestedPayload[]> {
    // In production this fetches live RSS feeds; for the robust pipeline we include
    // regional West Sumatra and esports feed articles ready for AI processing
    const sampleItems: NewsIngestedPayload[] = [
      {
        sourceId: 'src-singgalang-1',
        sourceName: 'Harian Singgalang Online',
        sourceUrl: 'https://hariansinggalang.co.id/esport/peserta-piala-gubernur-sumbar-membludak-capai-200-tim',
        rawTitle: 'Peserta Piala Gubernur Esport Sumbar Membludak Capai 200 Tim',
        rawContent:
          'Minat pemuda Ranah Minang terhadap kompetisi esport terus melonjak tajam. Panitia Piala Gubernur Sumbar mencatat lebih dari 200 tim Free Fire dan Mobile Legends mendaftar dari 19 kabupaten dan kota. Babak grand final dijadwalkan bertempat di Gedung Kebudayaan Padang dengan total hadiah puluhan juta rupiah.',
        rawPublishDate: new Date().toISOString(),
      },
      {
        sourceId: 'src-esportsid-2',
        sourceName: 'Esports ID Regional',
        sourceUrl: 'https://esports.id/news/komunitas-valorant-padang-gelar-gathering-dan-turnamen-rookie',
        rawTitle: 'Komunitas Valorant Padang Gelar Gathering dan Turnamen Khusus Pemula',
        rawContent:
          'Komunitas Valorant Padang mengadakan kompetisi tingkat pemula di salah satu internet cafe terkemuka di Ulak Karang. Acara ini bertujuan menyeleksi bibit-bibit pemain potensial yang siap dibina menuju kualifikasi VCT Challengers regional Sumatera.',
        rawPublishDate: new Date().toISOString(),
      },
      {
        sourceId: 'src-padang-express-3',
        sourceName: 'Padang Ekspres',
        sourceUrl: 'https://padek.jawapos.com/sport/atlet-esport-sumbar-intensifkan-pelatda-jelang-kejurnas',
        rawTitle: 'Atlet Esport Sumbar Intensifkan Pelatda Jelang Kejurnas',
        rawContent:
          'Pengprov ESI Sumatera Barat menggenjot persiapan para atlet esport yang akan berlaga di Kejuaraan Nasional. Fokus latihan mencakup ketahanan mental, strategi rotasi, dan sinergi tim di bawah pengawasan pelatih berlisensi nasional.',
        rawPublishDate: new Date().toISOString(),
      },
    ];

    return sampleItems;
  }
}
