import { z } from 'zod';

// Roles & Cities
export const UserRoleEnum = z.enum(['USER', 'ORGANIZER', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleEnum>;

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
});
export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nickname: z.string(),
  role: UserRoleEnum,
  city: z.string().nullable().optional(),
  mainGames: z.array(z.string()),
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

// Tournament Bracket DTOs
export const TournamentFormatEnum = z.enum([
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'ROUND_ROBIN',
  'SWISS',
  'LEADERBOARD',
]);
export type TournamentFormat = z.infer<typeof TournamentFormatEnum>;

