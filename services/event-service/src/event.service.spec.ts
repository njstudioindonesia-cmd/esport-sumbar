import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { EventRepository } from './database/event.repository';
import { EventService } from './event.service';

describe('EventService (CRUD, Dynamic Form Builder, Registration & Tenant Isolation)', () => {
  let service: EventService;

  beforeEach(() => {
    const repo = new EventRepository();
    service = new EventService(repo);
  });

  it('lists public events and filters by scope SUMBAR and game MLBB', () => {
    const sumbarEvents = service.listPublicEvents({
      scope: 'SUMBAR',
      gameId: 'MLBB',
    });
    expect(sumbarEvents.length).toBeGreaterThanOrEqual(1);
    expect(sumbarEvents[0]?.slug).toBe('minangkabau-esport-cup-season-4');
  });

  it('enforces strict Tenant Isolation so EO B cannot modify or view EO A event management', () => {
    expect(() =>
      service.getEoEventManagement(
        'evt-minangkabau-cup-2026',
        'user-eo-2',
        'ORGANIZER',
      ),
    ).toThrow(ForbiddenException);

    expect(() =>
      service.updateRegistrationForm(
        'evt-minangkabau-cup-2026',
        'user-eo-2',
        'ORGANIZER',
        { quota: 64 },
      ),
    ).toThrow(ForbiddenException);

    expect(() =>
      service.exportParticipantsCsv(
        'evt-minangkabau-cup-2026',
        'user-eo-2',
        'ORGANIZER',
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows the owning EO to update Form Builder schema and validates dynamic fields on registration', () => {
    const updatedForm = service.updateRegistrationForm(
      'evt-val-campus-padang-2026',
      'user-eo-1',
      'ORGANIZER',
      {
        quota: 16,
        fee: 0,
        requirePaymentProof: false,
        fields: [
          {
            id: 'institutionName',
            label: 'Nama Kampus Asal',
            type: 'TEXT',
            required: true,
          },
          {
            id: 'campusRegion',
            label: 'Domisili Kampus',
            type: 'SELECT',
            required: true,
            options: ['Padang', 'Bukittinggi', 'Payakumbuh'],
          },
        ],
      },
    );
    expect(updatedForm.fields.length).toBe(2);

    // Missing required field should fail
    expect(() =>
      service.submitRegistration('valorant-campus-series-sumbar-2026', {
        userId: 'user-new-val-1',
        userNickname: 'ValCaptain',
        participantType: 'TEAM',
        teamName: 'PNP Cypher Squad',
        teamMembers: [{ nickname: 'ValCaptain', gameId: 'Val#001', role: 'IGL' }],
        answers: {
          institutionName: 'Politeknik Negeri Padang',
          // campusRegion missing
        },
      }),
    ).toThrow(BadRequestException);

    // Invalid SELECT option should fail
    expect(() =>
      service.submitRegistration('valorant-campus-series-sumbar-2026', {
        userId: 'user-new-val-1',
        userNickname: 'ValCaptain',
        participantType: 'TEAM',
        teamName: 'PNP Cypher Squad',
        teamMembers: [{ nickname: 'ValCaptain', gameId: 'Val#001', role: 'IGL' }],
        answers: {
          institutionName: 'Politeknik Negeri Padang',
          campusRegion: 'Jakarta', // not in options
        },
      }),
    ).toThrow(BadRequestException);

    // Valid submission succeeds
    const reg = service.submitRegistration('valorant-campus-series-sumbar-2026', {
      userId: 'user-new-val-1',
      userNickname: 'ValCaptain',
      participantType: 'TEAM',
      teamName: 'PNP Cypher Squad',
      teamMembers: [{ nickname: 'ValCaptain', gameId: 'Val#001', role: 'IGL' }],
      answers: {
        institutionName: 'Politeknik Negeri Padang',
        campusRegion: 'Padang',
      },
    });
    expect(reg.status).toBe('PENDING');
    expect(reg.teamName).toBe('PNP Cypher Squad');

    // Duplicate registration by same user fails
    expect(() =>
      service.submitRegistration('valorant-campus-series-sumbar-2026', {
        userId: 'user-new-val-1',
        userNickname: 'ValCaptain',
        participantType: 'TEAM',
        teamName: 'Another Team',
        teamMembers: [{ nickname: 'ValCaptain', gameId: 'Val#001' }],
        answers: {
          institutionName: 'Politeknik Negeri Padang',
          campusRegion: 'Padang',
        },
      }),
    ).toThrow(ConflictException);
  });

  it('approves participants, toggles check-in, and exports CSV with custom form columns', () => {
    const approved = service.updateParticipantStatus(
      'evt-minangkabau-cup-2026',
      'reg-mlbb-3',
      'user-eo-1',
      'ORGANIZER',
      { status: 'APPROVED' },
    );
    expect(approved.status).toBe('APPROVED');

    const checkedIn = service.toggleParticipantCheckIn(
      'evt-minangkabau-cup-2026',
      'reg-mlbb-3',
      'user-eo-1',
      'ORGANIZER',
    );
    expect(checkedIn.checkedIn).toBe(true);

    const csv = service.exportParticipantsCsv(
      'evt-minangkabau-cup-2026',
      'user-eo-1',
      'ORGANIZER',
    );
    expect(csv.totalRows).toBeGreaterThanOrEqual(4);
    expect(csv.csvContent).toContain('Padang Roar Esports');
    expect(csv.csvContent).toContain('Payakumbuh Bala Squad');
  });
});
