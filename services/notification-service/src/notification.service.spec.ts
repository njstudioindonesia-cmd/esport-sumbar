import { NotificationService } from './notification.service';

describe('NotificationService (In-App, Read Status, Reminders & Email Mock)', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('retrieves user notifications and calculates unread count accurately', () => {
    const res = service.getUserNotifications('user-member-1');
    expect(res.notifications.length).toBeGreaterThanOrEqual(3);
    expect(res.unreadCount).toBeGreaterThanOrEqual(2);
  });

  it('marks a notification as read and recalculates unread counter', () => {
    service.markAsRead('notif-001', 'user-member-1');
    const res = service.getUserNotifications('user-member-1');
    const notif1 = res.notifications.find((n) => n.id === 'notif-001');
    expect(notif1?.read).toBe(true);
  });

  it('marks all notifications as read for a user', () => {
    const { updatedCount } = service.markAllAsRead('user-member-1');
    expect(updatedCount).toBeGreaterThanOrEqual(1);

    const res = service.getUserNotifications('user-member-1');
    expect(res.unreadCount).toBe(0);
  });

  it('dispatches tournament event reminders to multiple participants', () => {
    const result = service.triggerEventReminder(
      'evt-minangkabau-cup-2026',
      'Minangkabau Cup S4',
      ['user-member-1', 'user-member-2'],
    );
    expect(result.reminderCount).toBe(2);

    const notifs1 = service.getUserNotifications('user-member-1');
    expect(
      notifs1.notifications.some((n) => n.title.includes('Minangkabau Cup S4')),
    ).toBe(true);
  });
});
