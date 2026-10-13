import { z } from 'zod';

// Roles & Cities
export const UserRoleEnum = z.enum(['USER', 'ORGANIZER', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const PortalAudienceEnum = z.enum(['public', 'eo', 'admin']);
export type PortalAudience = z.infer<typeof PortalAudienceEnum>;

export const SumbarCityEnum = z.enum([
  'Padang',
  'Bukittinggi',
  'Payakumbuh',
  'Solok',
  'Sawahlunto',
  'Padang Panjang',
  'Pariaman',
  'Agam',
  'Dharmasraya',
  'Kepulauan Mentawai',
  'Lima Puluh Kota',
  'Padang Pariaman',
  'Pasaman',
  'Pasaman Barat',
  'Pesisir Selatan',
  'Sijunjung',
  'Solok Selatan',
  'Tanah Datar',
]);

// Identity DTOs
export const RegisterDtoSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  nickname: z.string().min(3).max(30),
  city: SumbarCityEnum.optional(),
  mainGames: z.array(z.string()).default([]),
});
export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  audience: PortalAudienceEnum.optional(),
  code2fa: z.string().optional(),
});
export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string(),
  audience: PortalAudienceEnum.optional(),
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nickname: z.string(),
  role: UserRoleEnum,
  city: z.string().nullable().optional(),
  mainGames: z.array(z.string()),
  twoFactorEnabled: z.boolean().optional().default(false),
  createdAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const ApplyOrganizerDtoSchema = z.object({
  orgName: z.string().min(3).max(100),
  contactPhone: z.string().min(9).max(15),
  docs: z.array(z.string().url()).min(1, 'Minimal lampirkan 1 dokumen identitas/organisasi'),
  socialLinks: z.record(z.string()).optional(),
});
export type ApplyOrganizerDto = z.infer<typeof ApplyOrganizerDtoSchema>;

// News DTOs
export const ArticleStatusEnum = z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED']);
export type ArticleStatus = z.infer<typeof ArticleStatusEnum>;

export const ArticleSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  body: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().url(),
  category: z.string(),
  gameId: z.string().nullable().optional(),
  tags: z.array(z.string()),
  viralScore: z.number().min(0).max(100),
  status: ArticleStatusEnum,
  aiMeta: z.record(z.unknown()).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Article = z.infer<typeof ArticleSchema>;

// Community DTOs
export const CommunityTypeEnum = z.enum(['OFFICIAL', 'USER']);
export type CommunityType = z.infer<typeof CommunityTypeEnum>;

export const CommunityRoleEnum = z.enum(['MEMBER', 'MODERATOR', 'OWNER']);
export type CommunityRole = z.infer<typeof CommunityRoleEnum>;

export const CommunitySchema = z.object({
  id: z.string(),
  gameId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  type: CommunityTypeEnum,
  ownerId: z.string().nullable().optional(),
  region: z.string().optional(),
  memberCount: z.number().int().default(0),
  createdAt: z.string().datetime(),
});
export type Community = z.infer<typeof CommunitySchema>;

export const CommunityMemberSchema = z.object({
  userId: z.string(),
  nickname: z.string(),
  city: z.string().optional(),
  communityId: z.string(),
  role: CommunityRoleEnum,
  joinedAt: z.string().datetime(),
});
export type CommunityMember = z.infer<typeof CommunityMemberSchema>;

export const CommunityCommentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  authorId: z.string(),
  authorNickname: z.string(),
  authorRole: CommunityRoleEnum.optional(),
  parentId: z.string().nullable().optional(),
  content: z.string(),
  createdAt: z.string().datetime(),
});
export type CommunityComment = z.infer<typeof CommunityCommentSchema>;

export const PostStatusEnum = z.enum(['PUBLISHED', 'FLAGGED', 'REJECTED']);
export type PostStatus = z.infer<typeof PostStatusEnum>;

export const CommunityPostSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  authorId: z.string(),
  authorNickname: z.string(),
  authorRole: CommunityRoleEnum.optional(),
  content: z.string(),
  media: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
  likesCount: z.number().int().default(0),
  commentsCount: z.number().int().default(0),
  status: PostStatusEnum.default('PUBLISHED'),
  moderationReason: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type CommunityPost = z.infer<typeof CommunityPostSchema>;

export const ReportTargetTypeEnum = z.enum(['POST', 'COMMENT']);
export const ReportStatusEnum = z.enum(['PENDING', 'RESOLVED', 'DISMISSED']);

export const ContentReportSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  targetType: ReportTargetTypeEnum,
  targetId: z.string(),
  targetPreview: z.string(),
  reporterId: z.string(),
  reporterNickname: z.string(),
  reason: z.string(),
  category: z.enum(['SPAM', 'TOXIC', 'SARA', 'JUDI', 'LAINNYA']),
  status: ReportStatusEnum.default('PENDING'),
  aiFlagged: z.boolean().default(false),
  createdAt: z.string().datetime(),
});
export type ContentReport = z.infer<typeof ContentReportSchema>;

// Event & EO DTOs
export const EventScopeEnum = z.enum(['SUMBAR', 'NASIONAL', 'GLOBAL']);
export type EventScope = z.infer<typeof EventScopeEnum>;

export const EventModeEnum = z.enum(['ONLINE', 'OFFLINE']);
export type EventMode = z.infer<typeof EventModeEnum>;

export const EventStatusEnum = z.enum([
  'DRAFT',
  'REGISTRATION_OPEN',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
]);
export type EventStatus = z.infer<typeof EventStatusEnum>;

export const ParticipantTypeEnum = z.enum(['INDIVIDUAL', 'TEAM', 'BOTH']);
export type ParticipantType = z.infer<typeof ParticipantTypeEnum>;

export const EventSchema = z.object({
  id: z.string(),
  organizerId: z.string(),
  organizerName: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  gameId: z.string(),
  scope: EventScopeEnum,
  mode: EventModeEnum,
  location: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  prizePool: z.number().nonnegative(),
  prizeDescription: z.string().optional(),
  status: EventStatusEnum,
  bannerUrl: z.string().nullable().optional(),
  rulebookUrl: z.string().nullable().optional(),
  isExternal: z.boolean().optional(),
  externalUrl: z.string().nullable().optional(),
  linkedCommunityIds: z.array(z.string()).optional(),
  participantType: ParticipantTypeEnum.optional(),
  registeredCount: z.number().int().nonnegative().optional(),
  quota: z.number().int().positive().optional(),
  createdAt: z.string().datetime(),
});
export type EventItem = z.infer<typeof EventSchema>;

// Registration Form Builder DTOs
export const FormFieldTypeEnum = z.enum([
  'TEXT',
  'SELECT',
  'FILE',
  'GAME_ID',
  'TEAM_ROSTER',
  'PHONE',
]);
export type FormFieldType = z.infer<typeof FormFieldTypeEnum>;

export const FormFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: FormFieldTypeEnum,
  required: z.boolean().default(true),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  maxRosterSize: z.number().int().positive().optional(),
});
export type FormField = z.infer<typeof FormFieldSchema>;

export const RegistrationFormSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  fields: z.array(FormFieldSchema),
  quota: z.number().int().positive(),
  deadline: z.string().datetime(),
  fee: z.number().nonnegative().default(0),
  paymentInstructions: z.string().optional(),
  requirePaymentProof: z.boolean().default(false),
  updatedAt: z.string().datetime(),
});
export type RegistrationForm = z.infer<typeof RegistrationFormSchema>;

// Registration & Participant DTOs
export const RegistrationStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'WAITLIST']);
export type RegistrationStatus = z.infer<typeof RegistrationStatusEnum>;

export const TeamMemberSchema = z.object({
  nickname: z.string(),
  gameId: z.string(),
  role: z.string().optional(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const EventRegistrationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  userNickname: z.string(),
  city: z.string().optional(),
  participantType: z.enum(['INDIVIDUAL', 'TEAM']),
  teamName: z.string().optional(),
  teamMembers: z.array(TeamMemberSchema).default([]),
  communityId: z.string().optional(),
  answers: z.record(z.unknown()).default({}),
  status: RegistrationStatusEnum.default('PENDING'),
  checkedIn: z.boolean().default(false),
  checkedInAt: z.string().datetime().nullable().optional(),
  proofFileId: z.string().nullable().optional(),
  proofFileUrl: z.string().nullable().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type EventRegistration = z.infer<typeof EventRegistrationSchema>;

export const EventAnnouncementSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  organizerId: z.string(),
  title: z.string(),
  content: z.string(),
  important: z.boolean().default(false),
  createdAt: z.string().datetime(),
});
export type EventAnnouncement = z.infer<typeof EventAnnouncementSchema>;

// Media & Event Storage DTOs
export const MediaFileCategoryEnum = z.enum([
  'POSTER',
  'RULEBOOK',
  'PAYMENT_PROOF',
  'PARTICIPANT_DOC',
  'CSV_EXPORT',
]);
export type MediaFileCategory = z.infer<typeof MediaFileCategoryEnum>;

export const MediaFileSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  eventId: z.string(),
  fileName: z.string(),
  key: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  mimeType: z.string(),
  category: MediaFileCategoryEnum,
  visibility: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
  createdAt: z.string().datetime(),
});
export type MediaFile = z.infer<typeof MediaFileSchema>;

export const EventStorageSummarySchema = z.object({
  eventId: z.string(),
  organizerId: z.string(),
  usedBytes: z.number().int().nonnegative(),
  quotaBytes: z.number().int().positive(),
  usagePercent: z.number().min(0).max(100),
  files: z.array(MediaFileSchema),
});
export type EventStorageSummary = z.infer<typeof EventStorageSummarySchema>;

// Tournament Bracket & Leaderboard DTOs
export const TournamentFormatEnum = z.enum([
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'ROUND_ROBIN',
  'SWISS',
  'GROUP_PLAYOFF',
  'LEADERBOARD',
]);
export type TournamentFormat = z.infer<typeof TournamentFormatEnum>;

export const SeedingTypeEnum = z.enum(['MANUAL', 'RANDOM', 'RATING']);
export type SeedingType = z.infer<typeof SeedingTypeEnum>;

export const BracketStageEnum = z.enum([
  'UPPER',
  'LOWER',
  'GRAND_FINAL',
  'ROUND_ROBIN',
  'SWISS',
  'GROUP_A',
  'GROUP_B',
  'PLAYOFF',
]);
export type BracketStage = z.infer<typeof BracketStageEnum>;

export const MatchStateEnum = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'BYE',
]);
export type MatchState = z.infer<typeof MatchStateEnum>;

export const BracketParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  seed: z.number().int().positive(),
  rating: z.number().optional(),
  city: z.string().optional(),
  communityId: z.string().optional(),
});
export type BracketParticipant = z.infer<typeof BracketParticipantSchema>;

export const BracketMatchSchema = z.object({
  id: z.string(),
  tournamentId: z.string(),
  stage: BracketStageEnum,
  round: z.number().int().positive(),
  matchNumber: z.number().int().positive(),
  slotA: z.string().nullable().optional(),
  slotB: z.string().nullable().optional(),
  participantAName: z.string().nullable().optional(),
  participantBName: z.string().nullable().optional(),
  scoreA: z.number().int().default(0),
  scoreB: z.number().int().default(0),
  winnerId: z.string().nullable().optional(),
  nextMatchId: z.string().nullable().optional(),
  nextMatchSlot: z.enum(['A', 'B']).nullable().optional(),
  loserNextMatchId: z.string().nullable().optional(),
  loserNextMatchSlot: z.enum(['A', 'B']).nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  state: MatchStateEnum.default('PENDING'),
});
export type BracketMatch = z.infer<typeof BracketMatchSchema>;

export const PointRuleConfigSchema = z.object({
  winPoints: z.number().default(3),
  drawPoints: z.number().default(1),
  lossPoints: z.number().default(0),
  killPointValue: z.number().default(1),
  placementPointsMap: z.record(z.number()).default({
    '1': 12,
    '2': 9,
    '3': 8,
    '4': 7,
    '5': 6,
    '6': 5,
    '7': 4,
    '8': 3,
    '9': 2,
    '10': 1,
    '11': 0,
    '12': 0,
  }),
  tiebreakerOrder: z
    .array(
      z.enum([
        'TOTAL_POINTS',
        'KILL_POINTS',
        'HEAD_TO_HEAD',
        'SCORE_DIFF',
        'BUCHHOLZ',
      ]),
    )
    .default([
      'TOTAL_POINTS',
      'KILL_POINTS',
      'HEAD_TO_HEAD',
      'SCORE_DIFF',
      'BUCHHOLZ',
    ]),
});
export type PointRuleConfig = z.infer<typeof PointRuleConfigSchema>;

export const StandingEntrySchema = z.object({
  rank: z.number().int().positive(),
  participantId: z.string(),
  participantName: z.string(),
  city: z.string().optional(),
  group: z.string().optional(),
  played: z.number().int().nonnegative(),
  wins: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  scoreFor: z.number().int().nonnegative(),
  scoreAgainst: z.number().int().nonnegative(),
  scoreDiff: z.number().int(),
  placementPoints: z.number().nonnegative(),
  killPoints: z.number().nonnegative(),
  totalPoints: z.number().nonnegative(),
  headToHeadWins: z.number().int().nonnegative(),
  buchholzScore: z.number().nonnegative(),
});
export type StandingEntry = z.infer<typeof StandingEntrySchema>;

export const TournamentSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventSlug: z.string(),
  eventTitle: z.string(),
  organizerId: z.string(),
  gameId: z.string(),
  format: TournamentFormatEnum,
  seedingType: SeedingTypeEnum,
  bestOf: z.number().int().positive().default(3),
  pointConfig: PointRuleConfigSchema,
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']).default('ACTIVE'),
  participants: z.array(BracketParticipantSchema),
  matches: z.array(BracketMatchSchema),
  standings: z.array(StandingEntrySchema),
  updatedAt: z.string().datetime(),
});
export type Tournament = z.infer<typeof TournamentSchema>;

// Phase 7: Notifications & Notification Service DTOs
export const NotificationChannelEnum = z.enum(['IN_APP', 'EMAIL']);
export type NotificationChannel = z.infer<typeof NotificationChannelEnum>;

export const NotificationTypeEnum = z.enum([
  'REGISTRATION_STATUS',
  'EVENT_REMINDER',
  'ANNOUNCEMENT',
  'COMMUNITY_ALERT',
]);
export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export const NotificationItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeEnum,
  title: z.string(),
  message: z.string(),
  link: z.string().optional(),
  read: z.boolean().default(false),
  channel: NotificationChannelEnum.default('IN_APP'),
  createdAt: z.string().datetime(),
});
export type NotificationItem = z.infer<typeof NotificationItemSchema>;

// Phase 7: EO AI Assistant DTOs
export const EoAssistantResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  rulebook: z.string(),
  recommendedFormat: TournamentFormatEnum,
  recommendedBestOf: z.number().int().positive(),
  prizeDistribution: z.string(),
  suggestedFormFields: z.array(z.string()),
});
export type EoAssistantResponse = z.infer<typeof EoAssistantResponseSchema>;

// Phase 7: Smart Search DTOs
export const SearchResultTypeEnum = z.enum(['NEWS', 'COMMUNITY', 'EVENT']);
export type SearchResultType = z.infer<typeof SearchResultTypeEnum>;

export const SearchResultItemSchema = z.object({
  id: z.string(),
  type: SearchResultTypeEnum,
  title: z.string(),
  snippet: z.string(),
  link: z.string(),
  score: z.number().min(0).max(1),
  category: z.string().optional(),
  city: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;

// Phase 7: AI Personalization Recommendations DTOs
export const AiRecommendationSchema = z.object({
  userId: z.string(),
  userCity: z.string().optional(),
  recommendedCommunities: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      gameId: z.string(),
      reason: z.string(),
    }),
  ),
  recommendedEvents: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      gameId: z.string(),
      city: z.string().optional(),
      prizePool: z.number(),
      reason: z.string(),
    }),
  ),
});
export type AiRecommendation = z.infer<typeof AiRecommendationSchema>;

// ==============================================================================
// UPDATE v2 CONTRACTS & SCHEMAS
// ==============================================================================

// Two-Factor Authentication (2FA TOTP)
export const TwoFactorSetupResponseSchema = z.object({
  secret: z.string(),
  otpauthUrl: z.string(),
  qrCodeUrl: z.string().optional(),
});
export type TwoFactorSetupResponse = z.infer<typeof TwoFactorSetupResponseSchema>;

export const TwoFactorVerifyRequestSchema = z.object({
  token: z.string().length(6),
  secret: z.string().optional(),
});
export type TwoFactorVerifyRequest = z.infer<typeof TwoFactorVerifyRequestSchema>;

// Admin Audit Log
export const AdminAuditLogSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  actorRole: z.enum(['USER', 'ORGANIZER', 'ADMIN', 'SYSTEM']),
  action: z.string(),
  entity: z.string(),
  entityId: z.string().optional(),
  diff: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  timestamp: z.string().datetime(),
});
export type AdminAuditLog = z.infer<typeof AdminAuditLogSchema>;

// Instagram Graph API Connection & Sync
export const InstagramConnectionSchema = z.object({
  id: z.string(),
  igUserId: z.string(),
  username: z.string().default('esportsumbar'),
  expiresAt: z.string().datetime(),
  daysRemaining: z.number().int(),
  lastSyncAt: z.string().datetime().optional(),
  mode: z.enum(['REVIEW', 'AUTO']).default('REVIEW'),
  status: z.enum(['CONNECTED', 'EXPIRING', 'EXPIRED', 'DISCONNECTED']).default('CONNECTED'),
});
export type InstagramConnection = z.infer<typeof InstagramConnectionSchema>;

// Event Draft Extracted from Instagram / External Feeds
export const EventDraftSchema = z.object({
  id: z.string(),
  fromArticleId: z.string().optional(),
  extractedTitle: z.string(),
  extractedGame: z.string().optional(),
  extractedCity: z.string().optional(),
  extractedDate: z.string().optional(),
  extractedPrize: z.string().optional(),
  rawCaption: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  createdAt: z.string().datetime(),
});
export type EventDraft = z.infer<typeof EventDraftSchema>;

// Participant / Winner Certificate
export const CertificateSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventTitle: z.string(),
  participantId: z.string(),
  participantName: z.string(),
  type: z.enum(['PARTICIPATION', 'WINNER', 'RUNNER_UP', 'THIRD_PLACE', 'MVP']),
  issuedAt: z.string().datetime(),
  verificationCode: z.string(),
});
export type Certificate = z.infer<typeof CertificateSchema>;




