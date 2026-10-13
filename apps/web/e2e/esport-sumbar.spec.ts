import { test, expect } from '@playwright/test';

test.describe('ESPORT SUMBAR — End-to-End User Journey Tests', () => {
  test('Journey 1: Homepage renders brand, ticker, headline, and Smart Feed AI', async ({
    page,
  }) => {
    await page.goto('/');

    // Check brand header
    await expect(page.locator('text=ESPORT SUMBAR').first()).toBeVisible();

    // Check Live standings ticker
    await expect(page.locator('text=LIVE STANDINGS // SUMBAR')).toBeVisible();

    // Check headline news
    await expect(page.locator('text=Headline Berita Esport')).toBeVisible();

    // Check Smart Feed AI section
    await expect(page.locator('text=Rekomendasi Pintar Gamers Ranah Minang')).toBeVisible();
    await expect(page.locator('button:has-text("Bukittinggi")').first()).toBeVisible();
  });

  test('Journey 2: Authentication & Profile Management Flow', async ({ page }) => {
    // Navigate to Login page
    await page.goto('/masuk');
    await expect(page.locator('text=Masuk ke ESPORT SUMBAR')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Navigate to Register page
    await page.goto('/daftar');
    await expect(page.locator('text=Daftar Akun Baru')).toBeVisible();
    await expect(page.locator('select')).toBeVisible(); // City selector

    // Navigate to Profil page
    await page.goto('/profil');
    await expect(page.locator('text=Kelola Informasi Profil')).toBeVisible();
    await expect(page.locator('text=Rekomendasi AI Khusus Gamer')).toBeVisible();
  });

  test('Journey 3: News Portal & Detail Reading Flow', async ({ page }) => {
    await page.goto('/berita');
    await expect(page.locator('h1:has-text("Warta & Berita Esport")')).toBeVisible();

    // Check filter pills
    await expect(page.locator('button:has-text("Semua")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Sumbar")').first()).toBeVisible();

    // Check article card exists
    await expect(page.locator('text=Tim Esport Sumbar Siap Berlaga di PON').first()).toBeVisible();
  });

  test('Journey 4: Community Hub & Game Hub Flow', async ({ page }) => {
    await page.goto('/komunitas');
    await expect(page.locator('h1:has-text("Komunitas Gamers Sumbar")')).toBeVisible();

    // Open detail of MLBB Sumbar community
    await page.goto('/komunitas/mlbb-sumbar');
    await expect(page.locator('h1:has-text("Mobile Legends Bang Bang Sumatera Barat")')).toBeVisible();

    // Verify community tabs
    await expect(page.locator('button:has-text("Diskusi")')).toBeVisible();
    await expect(page.locator('button:has-text("Turnamen")')).toBeVisible();
    await expect(page.locator('button:has-text("Bracket")')).toBeVisible();
    await expect(page.locator('button:has-text("Anggota")')).toBeVisible();
  });

  test('Journey 5: Tournament Detail & Dynamic Registration Flow', async ({ page }) => {
    await page.goto('/event');
    await expect(page.locator('h1:has-text("Turnamen & Event Esport")')).toBeVisible();

    // Open registration page
    await page.goto('/event/minangkabau-esport-cup-season-4/daftar');
    await expect(page.locator('text=Pendaftaran Turnamen')).toBeVisible();
    await expect(page.locator('text=Informasi Tim & Kapten')).toBeVisible();
    await expect(page.locator('input[placeholder*="Nama Tim"]').first()).toBeVisible();
  });

  test('Journey 6: Broadcast Bracket Viewer & Standalone Embed Flow', async ({ page }) => {
    // Open Tournament Broadcast Bracket Viewer
    await page.goto('/event/minangkabau-esport-cup-season-4/bracket');
    await expect(page.locator('text=BROADCAST BRACKET VIEWER')).toBeVisible();
    await expect(page.locator('text=LIVE SSE')).toBeVisible();
    await expect(page.locator('button:has-text("Format Bracket")')).toBeVisible();
    await expect(page.locator('button:has-text("Leaderboard BR")')).toBeVisible();

    // Open Standalone Embed Widget
    await page.goto('/embed/bracket/evt-minangkabau-cup-2026');
    await expect(page.locator('text=ESPORT SUMBAR EMBED')).toBeVisible();
    await expect(page.locator('text=LIVE')).toBeVisible();
  });

  test('Journey 7: Smart Semantic Search & Notification Center Flow', async ({ page }) => {
    // Smart Semantic Search
    await page.goto('/cari');
    await expect(page.locator('h1:has-text("Pencarian Cerdas")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Cari turnamen"]')).toBeVisible();
    await expect(page.locator('button:has-text("Turnamen MLBB Padang")')).toBeVisible();

    // In-App Notification Center
    await page.goto('/notifikasi');
    await expect(page.locator('h1:has-text("Pusat Notifikasi")')).toBeVisible();
    await expect(page.locator('button:has-text("Kirim Simulasi Reminder")')).toBeVisible();
  });
});
