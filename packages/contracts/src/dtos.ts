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
export const EventModeEnum = z.enum(['ONLINE', 'OFFLINE']);
export const EventStatusEnum = z.enum(['DRAFT', 'REGISTRATION_OPEN', 'ONGOING', 'COMPLETED', 'CANCELLED']);

export const EventSchema = z.object({
  id: z.string().uuid(),
  organizerId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  gameId: z.string(),
  scope: EventScopeEnum,
  mode: EventModeEnum,
  location: z.string().nullable().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  prizePool: z.number().nonnegative(),
  prizeDescription: z.string().optional(),
  status: EventStatusEnum,
  bannerUrl: z.string().url().nullable().optional(),
  rulebookUrl: z.string().url().nullable().optional(),
  createdAt: z.string().datetime(),
});
export type EventItem = z.infer<typeof EventSchema>;

// Tournament Bracket DTOs
export const TournamentFormatEnum = z.enum([
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'ROUND_ROBIN',
  'SWISS',
  'LEADERBOARD',
]);
export type TournamentFormat = z.infer<typeof TournamentFormatEnum>;
