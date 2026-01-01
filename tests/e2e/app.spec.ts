import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('Application', () => {
  test('should launch successfully', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../../electron/main.cjs')],
    });

    const window = await electronApp.firstWindow();
    await expect(window).toHaveTitle(/YCview/);

    await electronApp.close();
  });
});
