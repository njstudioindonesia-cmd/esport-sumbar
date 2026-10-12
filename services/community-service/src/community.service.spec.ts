import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from './community.service';
import { CommunityRepository } from './database/community.repository';

describe('CommunityService', () => {
  let service: CommunityService;

  beforeEach(async () => {
    const mockEnv = {
      PORT: 4004,
      AI_SERVICE_URL: 'http://localhost:4008',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        CommunityRepository,
        {
          provide: 'CONFIG',
          useValue: mockEnv,
        },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
  });

  it('should be defined and list initial communities', async () => {
    const list = await service.listCommunities();
    expect(list.length).toBeGreaterThanOrEqual(4);
  });

  it('should allow user to join and leave community', async () => {
    const joined = await service.joinCommunity('com-001', 'usr-new-99', 'MinangGamer99', 'Solok');
    expect(joined.role).toBe('MEMBER');

    const leftRes = await service.leaveCommunity('com-001', 'usr-new-99');
    expect(leftRes.left).toBe(true);
  });

  it('should prevent OWNER from leaving community without transferring ownership', async () => {
    await expect(service.leaveCommunity('com-001', 'usr-admin-1')).rejects.toThrow();
  });

  it('should allow clean post creation via AI Pre-Moderation', async () => {
    const post = await service.createPost('com-001', 'usr-player-1', 'RizkySlayer99', {
      content: 'Ayo mabar dan latihan persiapan turnamen Padang minggu depan!',
    });
    expect(post.id).toBeDefined();
    expect(post.status).toBe('PUBLISHED');
  });

  it('should reject illegal gambling / toxic post via AI Pre-Moderation and create audit report', async () => {
    await expect(
      service.createPost('com-001', 'usr-player-1', 'RizkySlayer99', {
        content: 'Daftar situs slot gacor maxwin hari ini pasti menang!',
      }),
    ).rejects.toThrow();

    const reports = await service.listReports('PENDING');
    expect(reports.some((r) => r.aiFlagged && r.category === 'JUDI')).toBe(true);
  });

  it('should enforce 1-level comment nesting (flattening replies to child comments)', async () => {
    // cmt-001 is root, cmt-002 is reply to cmt-001
    const replyToChild = await service.createComment(
      'post-001',
      'usr-player-1',
      'RizkySlayer99',
      {
        content: 'Siap bang moderator, terima kasih infonya!',
        parentId: 'cmt-002', // replying to level-1 child
      },
    );

    // Must be flattened to root comment cmt-001 (1-level nesting rule)
    expect(replyToChild.parentId).toBe('cmt-001');
  });

  it('should restrict post pinning to MODERATOR or OWNER only', async () => {
    // usr-player-1 is MEMBER -> should fail
    await expect(
      service.togglePinPost('com-001', 'post-002', 'usr-player-1'),
    ).rejects.toThrow();

    // usr-mod-1 is MODERATOR -> should succeed
    const pinnedPost = await service.togglePinPost('com-001', 'post-002', 'usr-mod-1');
    expect(pinnedPost.pinned).toBe(true);
  });
});
