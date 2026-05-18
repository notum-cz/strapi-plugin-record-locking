import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
/**
 * This test verifies that when a user opens an entry for editing, other users see a locking modal if they try to access the same entry.
 * It simulates two users (User 1 and User 2) accessing the same entry and checks that User 2 sees the locking modal when User 1 has the entry open.
 *
 * Prerequisites:
 * - Two user accounts (e.g. dev1@example.com, dev2@example.com) with appropriate permissions to access the content manager and edit entries.
 * - At least one entry in the "blog-article" collection type to test with.
 *
 * Steps:
 * 1. User 1 logs in and opens an entry for editing.
 * 2. User 2 logs in and tries to access the same entry.
 * 3. Assert that User 2 sees the locking modal indicating that the entry is currently being edited by User 1.
 */

const TEST_COLLECTION_NAME = 'api::blog-article.blog-article';

const TEST_COLLECTION_URL = `/admin/content-manager/collection-types/${TEST_COLLECTION_NAME}`;

type TestUser = {
  email: string;
  password: string;
};
const TEST_USER_1: TestUser = {
  email: 'dev1@example.com',
  password: 'Dev1@example.com',
};

const TEST_USER_2: TestUser = {
  email: 'dev2@example.com',
  password: 'Dev2@example.com',
};

async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/admin/auth/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin(?!\/auth)/);
}

test.describe('Record locking', () => {
  let context1: BrowserContext;
  let context2: BrowserContext;
  let page1: Page;
  let page2: Page;

  test.beforeEach(async ({ browser }: { browser: Browser }) => {
    context1 = await browser.newContext();
    context2 = await browser.newContext();
    page1 = await context1.newPage();
    page2 = await context2.newPage();
  });

  test.afterEach(async () => {
    await context1.close();
    await context2.close();
  });

  test('second user sees locking modal when opening an entry already being edited', async () => {
    // --- User 1: open the first article entry ---
    await loginUser(page1, TEST_USER_1.email, TEST_USER_1.password);

    await page1.goto(TEST_COLLECTION_URL);
    await page1.waitForLoadState('networkidle');

    // Click the first row in the entry list to open the edit view
    await page1.locator('table tbody tr').first().click();

    // Wait until the URL contains a document ID (edit view)
    await page1.waitForURL(/\/api::blog-article\.blog-article\/.+/);

    const entryUrl = page1.url();

    // Wait for the socket.io lock to be established before the second user opens the entry
    await page1.waitForLoadState('networkidle');

    // --- User 2: navigate to the same entry ---
    await loginUser(page2, TEST_USER_2.email, TEST_USER_2.password);

    await page2.goto(entryUrl);
    await page2.waitForLoadState('networkidle');

    // Assert the record-locking modal is visible
    await expect(page2.getByTestId('entity-lock-modal')).toBeVisible();
  });
});
