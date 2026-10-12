import { z } from 'zod';

export const EventEnvelopeSchema = <T extends z.ZodTypeAny>(payloadSchema: T) =>
  z.object({
    eventId: z.string().uuid(),
    eventType: z.string(),
    version: z.string().default('v1'),
    timestamp: z.string().datetime(),
    correlationId: z.string().uuid(),
    payload: payloadSchema,
  });

// 1. user.registered
export const UserRegisteredPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  nickname: z.string(),
  role: z.enum(['USER', 'ORGANIZER', 'ADMIN']),
  city: z.string().optional(),
});
export type UserRegisteredPayload = z.infer<typeof UserRegisteredPayloadSchema>;

// 2. organizer.verified
export const OrganizerVerifiedPayloadSchema = z.object({
  userId: z.string().uuid(),
  orgName: z.string(),
  verifiedAt: z.string().datetime(),
  verifiedBy: z.string().uuid(),
});
export type OrganizerVerifiedPayload = z.infer<typeof OrganizerVerifiedPayloadSchema>;

// 3. news.ingested
export const NewsIngestedPayloadSchema = z.object({
  sourceId: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().url(),
  rawTitle: z.string(),
  rawContent: z.string(),
  rawPublishDate: z.string().optional(),
});
export type NewsIngestedPayload = z.infer<typeof NewsIngestedPayloadSchema>;

// 4. news.curated
export const NewsCuratedPayloadSchema = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  body: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().url(),
  category: z.string(),
  gameId: z.string().optional(),
  tags: z.array(z.string()),
  viralScore: z.number().min(0).max(100),
  aiConfidence: z.number().min(0).max(1),
  suggestedStatus: z.enum(['REVIEW', 'PUBLISHED']),
});
export type NewsCuratedPayload = z.infer<typeof NewsCuratedPayloadSchema>;

// 5. news.published
export const NewsPublishedPayloadSchema = z.object({
  articleId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  category: z.string(),
  gameId: z.string().optional(),
  publishedAt: z.string().datetime(),
});
export type NewsPublishedPayload = z.infer<typeof NewsPublishedPayloadSchema>;

// 6. event.published
export const EventPublishedPayloadSchema = z.object({
  eventId: z.string().uuid(),
  organizerId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  gameId: z.string(),
  scope: z.enum(['SUMBAR', 'NASIONAL', 'GLOBAL']),
  mode: z.enum(['ONLINE', 'OFFLINE']),
  location: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});
export type EventPublishedPayload = z.infer<typeof EventPublishedPayloadSchema>;

// 7. registration.submitted
export const RegistrationSubmittedPayloadSchema = z.object({
  registrationId: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  submittedAt: z.string().datetime(),
});
export type RegistrationSubmittedPayload = z.infer<typeof RegistrationSubmittedPayloadSchema>;

// 8. registration.approved
export const RegistrationApprovedPayloadSchema = z.object({
  registrationId: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  approvedAt: z.string().datetime(),
});
export type RegistrationApprovedPayload = z.infer<typeof RegistrationApprovedPayloadSchema>;

// 9. match.updated
export const MatchUpdatedPayloadSchema = z.object({
  matchId: z.string().uuid(),
  tournamentId: z.string().uuid(),
  round: z.number().int().positive(),
  slotA: z.string(),
  slotB: z.string(),
  scoreA: z.number().int(),
  scoreB: z.number().int(),
  winner: z.string().optional(),
  state: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISQUALIFIED']),
});
export type MatchUpdatedPayload = z.infer<typeof MatchUpdatedPayloadSchema>;

// 10. post.created
export const PostCreatedPayloadSchema = z.object({
  postId: z.string().uuid(),
  communityId: z.string().uuid(),
  authorId: z.string().uuid(),
  content: z.string(),
  media: z.array(z.string()).default([]),
});
export type PostCreatedPayload = z.infer<typeof PostCreatedPayloadSchema>;

// 11. moderation.result
export const ModerationResultPayloadSchema = z.object({
  targetType: z.enum(['POST', 'COMMENT']),
  targetId: z.string().uuid(),
  decision: z.enum(['APPROVE', 'FLAG', 'REJECT']),
  reason: z.string().optional(),
  categoriesFlagged: z.array(z.string()).default([]),
});
export type ModerationResultPayload = z.infer<typeof ModerationResultPayloadSchema>;

export const EVENT_TOPICS = {
  USER_REGISTERED: 'user.registered.v1',
  ORGANIZER_VERIFIED: 'organizer.verified.v1',
  NEWS_INGESTED: 'news.ingested.v1',
  NEWS_CURATED: 'news.curated.v1',
  NEWS_PUBLISHED: 'news.published.v1',
  EVENT_PUBLISHED: 'event.published.v1',
  REGISTRATION_SUBMITTED: 'registration.submitted.v1',
  REGISTRATION_APPROVED: 'registration.approved.v1',
  MATCH_UPDATED: 'match.updated.v1',
  POST_CREATED: 'post.created.v1',
  MODERATION_RESULT: 'moderation.result.v1',
} as const;
