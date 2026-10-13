import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  NotificationChannel,
  NotificationItem,
  NotificationType,
} from '@esport-sumbar/contracts';
import { StructuredLogger } from '@esport-sumbar/utils';

export interface SendNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  channel?: NotificationChannel;
}

@Injectable()
export class NotificationService {
  private readonly logger = new StructuredLogger('notification-service');
  private readonly notifications = new Map<string, NotificationItem>();

  constructor() {
    this.seedInitialNotifications();
  }

  private seedInitialNotifications(): void {
    const now = new Date();
    const min10Ago = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const hour2Ago = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const day1Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const seeded: NotificationItem[] = [
      {
        id: 'notif-001',
        userId: 'user-member-1',
        type: 'REGISTRATION_STATUS',
        title: 'Pendaftaran Tim Disetujui (APPROVED)',
        message:
          'Pendaftaran tim "Padang Roar Esports" di Minangkabau Esport Cup Season 4 telah disetujui oleh panitia EO.',
        link: '/event/minangkabau-esport-cup-season-4',
        read: false,
        channel: 'IN_APP',
        createdAt: min10Ago,
      },
      {
        id: 'notif-002',
        userId: 'user-member-1',
        type: 'EVENT_REMINDER',
        title: 'Pengingat Technical Meeting H-1',
        message:
          'Technical Meeting Discord resmi turnamen MLBB Season 4 dimulai besok pukul 19.30 WIB. Seluruh kapten wajib hadir.',
        link: '/event/minangkabau-esport-cup-season-4/bracket',
        read: false,
        channel: 'IN_APP',
        createdAt: hour2Ago,
      },
      {
        id: 'notif-003',
        userId: 'user-member-1',
        type: 'COMMUNITY_ALERT',
        title: 'Diskusi Baru di Komunitas MLBB Sumbar',
        message:
          'Post baru disematkan: "Open Scrim persiapan babak kualifikasi regional Padang".',
        link: '/komunitas/mlbb-sumbar',
        read: true,
        channel: 'IN_APP',
        createdAt: day1Ago,
      },
      {
        id: 'notif-004',
        userId: 'user-eo-1',
        type: 'ANNOUNCEMENT',
        title: 'Pendaftar Baru Menunggu Verifikasi',
        message:
          'Tim "Solok Bareh Warriors" baru saja mengirim formulir pendaftaran dan bukti pembayaran.',
        link: '/eo/event/evt-minangkabau-cup-2026?tab=participants',
        read: false,
        channel: 'IN_APP',
        createdAt: min10Ago,
      },
    ];

    for (const n of seeded) {
      this.notifications.set(n.id, n);
    }
  }

  getUserNotifications(userId: string): {
    notifications: NotificationItem[];
    unreadCount: number;
    total: number;
  } {
    const list = Array.from(this.notifications.values())
      .filter((n) => n.userId === userId || n.userId === 'all')
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const unreadCount = list.filter((n) => !n.read).length;

    return {
      notifications: list,
      unreadCount,
      total: list.length,
    };
  }

  markAsRead(id: string, userId?: string): NotificationItem {
    const notif = this.notifications.get(id);
    if (!notif) {
      throw new NotFoundException(`Notifikasi '${id}' tidak ditemukan`);
    }

    if (userId && notif.userId !== userId && notif.userId !== 'all') {
      throw new NotFoundException(`Notifikasi '${id}' bukan milik pengguna ini`);
    }

    const updated: NotificationItem = {
      ...notif,
      read: true,
    };
    this.notifications.set(id, updated);
    return updated;
  }

  markAllAsRead(userId: string): { updatedCount: number } {
    let count = 0;
    for (const [id, n] of this.notifications.entries()) {
      if ((n.userId === userId || n.userId === 'all') && !n.read) {
        this.notifications.set(id, { ...n, read: true });
        count++;
      }
    }
    return { updatedCount: count };
  }

  sendNotification(dto: SendNotificationDto): NotificationItem {
    const id = `notif-${uuidv4().slice(0, 8)}`;
    const channel = dto.channel || 'IN_APP';

    const item: NotificationItem = {
      id,
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      link: dto.link,
      read: false,
      channel,
      createdAt: new Date().toISOString(),
    };

    this.notifications.set(id, item);

    if (channel === 'EMAIL') {
      this.logger.info(
        `[MOCK EMAIL DISPATCH] Sent to user ${dto.userId}: "${dto.title}" - ${dto.message}`,
        'NotificationService',
      );
    }

    return item;
  }

  triggerEventReminder(
    eventId: string,
    eventTitle: string,
    participantUserIds: string[],
  ): { reminderCount: number; eventId: string } {
    for (const uid of participantUserIds) {
      this.sendNotification({
        userId: uid,
        type: 'EVENT_REMINDER',
        title: `Pengingat Turnamen: ${eventTitle}`,
        message: `Turnamen "${eventTitle}" akan segera dimulai. Pastikan kapten tim telah melakukan check-in ulang.`,
        link: `/event/${eventId}`,
        channel: 'IN_APP',
      });
    }

    return {
      reminderCount: participantUserIds.length,
      eventId,
    };
  }
}
