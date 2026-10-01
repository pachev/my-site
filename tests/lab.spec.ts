import { test, expect, type Page } from '@playwright/test';

async function enterLab(page: Page) {
  await page.goto('/lab');
  await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();
  await expect(page.locator('#lab-boot')).not.toBeVisible();
}
async function command(page: Page, text: string) {
  await page.getByRole('textbox', { name: 'Lab command' }).fill(text);
  await page.getByRole('textbox', { name: 'Lab command' }).press('Enter');
}
async function assertContained(page: Page, selector: string) {
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press(i % 3 === 0 ? 'Shift+Tab' : 'Tab');
    expect(await page.evaluate((selector) => document.querySelector(selector)?.contains(document.activeElement), selector)).toBe(true);
  }
}

for (const width of [400, 820, 1180, 1440]) {
  test(`Storage and Exit fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 });
    await enterLab(page);
    await page.getByRole('tab', { name: '3:STORAGE' }).click();
    const scene = page.getByRole('tabpanel', { name: '3:STORAGE' });
    expect(await scene.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    for (const target of ['.lab-stats', '.lab-sv', '.lab-wb-exit']) {
      const boxes = await page.locator(target).evaluateAll((els) => els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right };
      }));
      for (const box of boxes) { expect(box.left).toBeGreaterThanOrEqual(0); expect(box.right).toBeLessThanOrEqual(width); }
    }
  });
}

test('Space selects workspace tabs; arrows and number shortcuts still work', async ({ page }) => {
  await enterLab(page);
  const storage = page.getByRole('tab', { name: '3:STORAGE' });
  await storage.press('Space');
  await expect(storage).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#lab-shell')).not.toBeVisible();
  await storage.press('ArrowRight');
  await expect(page.getByRole('tab', { name: '4:LOG' })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: '1:NETWORK' })).toBeFocused();
  await page.keyboard.press('2');
  await expect(page.getByRole('tab', { name: '2:COMPUTE' })).toHaveAttribute('aria-selected', 'true');
});

test('boot, shell and trace contain focus and restore it on close', async ({ page }) => {
  await page.goto('/lab');
  await expect(page.getByRole('button', { name: 'ENTER SYSTEM' })).toBeVisible();
  await assertContained(page, '#lab-boot');
  await page.keyboard.press('Escape');
  const launcher = page.getByRole('button', { name: 'Open lab command palette' });
  for (let i = 0; i < 3; i++) {
    await launcher.click();
    await expect(page.getByRole('textbox', { name: 'Lab command' })).toBeFocused();
    await assertContained(page, '#lab-shell');
    await page.keyboard.press('Escape');
    await expect(launcher).toBeFocused();
  }
  const trace = page.getByRole('button', { name: 'Trace this page' });
  await trace.click();
  await assertContained(page, '#lab-trace');
  await page.keyboard.press('3');
  await expect(page.getByRole('tab', { name: '1:NETWORK', includeHidden: true })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await expect(trace).toBeFocused();
});

test('background Space opens shell; button Space keeps pointer behavior', async ({ page }) => {
  await enterLab(page);
  await page.locator('.lab-hintbar').first().click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('Space');
  await expect(page.getByRole('textbox', { name: 'Lab command' })).toBeFocused();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open ser5-proxmox inspector' }).press('Space');
  await expect(page.locator('[data-window-id="network-ser5-proxmox"]')).toBeVisible();
  await expect(page.locator('#lab-shell')).not.toBeVisible();
});

test('LOG links use actual writing metadata and navigate with browser history', async ({ page }) => {
  await enterLab(page);
  await page.getByRole('tab', { name: '4:LOG' }).click();
  const destinations = [
    ['Templating NixOS LXC Containers on Proxmox', '/posts/nixos-proxmox-lxc-template'],
    ['NixOS on Proxmox LXC: From Zero to Shell', '/posts/nixos-proxmox-lxc-from-scratch'],
    ['Setup Atuin For Shell History', '/posts/setup-atuin-shell-history'],
    ['ZFS Can Set Quotas on Datasets', '/tils/zfs-quotas-on-datasets'],
  ];
  for (const [title, href] of destinations) {
    const link = page.locator(`.lab-entry-article[href="${href}"]`);
    await expect(link).toContainText(title);
    await expect(link).toHaveAttribute('href', href);
    expect((await page.request.get(href)).status()).toBe(200);
  }
  await expect(page.locator('.lab-entry-article').filter({ hasText: 'Setup Atuin' })).toContainText('MAY 26 2025');
  await expect(page.getByText(/no articles yet/)).toHaveCount(0);
  await page.locator('.lab-entry-article').filter({ hasText: 'ZFS Can Set' }).click();
  await expect(page).toHaveURL(/\/tils\/zfs-quotas-on-datasets\/?$/);
  await page.goBack();
  await page.getByRole('button', { name: 'ENTER SYSTEM' }).click();
  await page.getByRole('tab', { name: '4:LOG' }).click();
  await expect(page.locator('.lab-entry-article')).toHaveCount(4);
});

test('trace steps, back, restart and reopening explain unverified stages', async ({ page }) => {
  await enterLab(page);
  await page.getByRole('button', { name: 'Trace this page' }).click();
  const trace = page.locator('#lab-trace');
  await expect(trace).toContainText('NO LIVE TRACE');
  const next = trace.getByRole('button', { name: 'Next' });
  await next.click();
  await expect(trace.locator('[data-trace-panel="1"]')).toBeVisible();
  await expect(trace.locator('[data-trace-panel="1"]')).toContainText('Cache behavior');
  await trace.getByRole('button', { name: 'Back' }).click();
  await expect(trace.locator('[data-trace-count]')).toHaveText('1 / 5');
  for (let i = 0; i < 4; i++) await next.click();
  await expect(trace.locator('[data-trace-panel="4"]')).toContainText('default static output');
  await trace.getByRole('button', { name: 'Restart' }).click();
  await expect(trace.locator('[data-trace-count]')).toHaveText('1 / 5');
  await trace.getByRole('button', { name: '3. Cloudflare Tunnel' }).click();
  await expect(trace.locator('[data-trace-panel="2"]')).toBeVisible();
  await trace.getByRole('button', { name: 'Close trace', exact: true }).last().click();
  await page.getByRole('button', { name: 'Trace this page' }).click();
  await expect(trace.locator('[data-trace-count]')).toHaveText('1 / 5');
  await page.locator('[data-trace-close]').first().click({ position: { x: 5, y: 5 } });
  await expect(trace).not.toBeVisible();
});

test('htop is a static demo, sorts independently, supports history and clear', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 820 });
  await enterLab(page);
  await page.getByRole('button', { name: 'Open lab command palette' }).click();
  await command(page, 'help');
  await expect(page.locator('[data-shell-output]')).toContainText('htop');
  await command(page, 'htop');
  const view = page.locator('.lab-htop');
  await expect(view).toContainText('DEMO PROCESSES · illustrative values · frozen, not live');
  await expect(view).toContainText('synthetic IDs');
  await expect(view).toContainText('SNAPSHOT · OCT 01 2026');
  await expect(view.getByRole('meter', { name: 'ser5-proxmox cpu snapshot usage' })).toHaveAttribute('value', '2.4');
  await expect(view.locator('tbody tr')).toHaveCount(5);
  await view.getByRole('button', { name: 'Sort memory' }).click();
  await expect(view.locator('tbody tr').nth(1)).toContainText('demo-worker');
  await assertContained(page, '#lab-shell');
  await page.getByRole('textbox', { name: 'Lab command' }).press('ArrowUp');
  await expect(page.getByRole('textbox', { name: 'Lab command' })).toHaveValue('htop');
  await page.keyboard.press('Enter');
  await expect(page.locator('.lab-htop')).toHaveCount(2);
  await command(page, 'bogus');
  await expect(page.locator('[data-shell-output]')).toContainText('command not found: bogus');
  await command(page, 'clear');
  await expect(page.locator('[data-shell-output]')).toBeEmpty();
  await command(page, 'fastfetch');
  await expect(page.locator('[data-shell-output]')).toContainText('PJ@LAB');
  await command(page, 'nixos-rebuild switch gruvbox');
  await expect(page.locator('#lab-desktop')).toHaveAttribute('data-lab-theme', 'gruvbox');
});

for (const width of [400, 1180]) {
  test(`terminal input edits inline and keeps keyboard focus cues at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 });
    await enterLab(page);
    const launcher = page.getByRole('button', { name: 'Open lab command palette' });
    await launcher.click();
    const input = page.getByRole('textbox', { name: 'Lab command' });
    const prompt = page.locator('.lab-shell-prompt');
    const output = page.locator('[data-shell-output]');
    const selection = () => input.evaluate((el) => {
      const field = el as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd];
    });
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS('outline-style', 'none');
    expect(await input.evaluate((el) => getComputedStyle(el).caretColor)).not.toMatch(/transparent|rgba\(.*?, 0\)/);
    await expect(prompt).toHaveCSS('text-decoration-line', 'underline');
    await expect(page.locator('.lab-shell-caret')).toHaveCount(0);
    await page.keyboard.type('help');
    await input.press('ArrowLeft');
    await input.press('ArrowLeft');
    expect(await selection()).toEqual([2, 2]);
    await page.keyboard.type('l');
    await expect(input).toHaveValue('hellp');
    await input.press('Backspace');
    await expect(input).toHaveValue('help');
    await input.press('Shift+ArrowRight');
    await input.press('Shift+ArrowRight');
    expect(await selection()).toEqual([2, 4]);
    await page.keyboard.type('lp');
    await expect(input).toHaveValue('help');
    await input.press('Enter');
    await expect(output).toContainText('COMMANDS');
    await command(page, 'fastfetch');
    const longCommand = 'x'.repeat(512);
    await input.fill(longCommand);
    await input.press('ArrowLeft');
    await input.press('Backspace');
    expect(await selection()).toEqual([510, 510]);
    await page.keyboard.type('x');
    await expect(input).toHaveValue(longCommand);
    expect(await input.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    await input.press('Enter');
    await expect(output).toContainText(`command not found: ${longCommand}`);
    expect(await page.locator('#lab-shell').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await input.press('ArrowUp');
    await expect(input).toHaveValue(longCommand);
    await input.press('ArrowUp');
    await expect(input).toHaveValue('fastfetch');
    await input.press('ArrowDown');
    await expect(input).toHaveValue(longCommand);
    await input.press('ArrowDown');
    await expect(input).toBeEmpty();
    expect(await selection()).toEqual([0, 0]);
    await command(page, 'clear');
    await input.press('Enter');
    await expect(output).toBeEmpty();
    await input.press('Tab');
    const close = page.getByRole('button', { name: 'Close command palette', exact: true }).last();
    await expect(close).toBeFocused();
    await expect(close).toHaveCSS('outline-style', 'solid');
    await expect(prompt).toHaveCSS('text-decoration-line', 'none');
    await page.keyboard.press('Shift+Tab');
    await expect(input).toBeFocused();
    await expect(prompt).toHaveCSS('text-decoration-line', 'underline');
    await page.keyboard.press('Escape');
    await expect(launcher).toBeFocused();
    await launcher.click();
    await expect(input).toBeFocused();
    await expect(input).toBeEmpty();
    expect(await selection()).toEqual([0, 0]);
  });
}

test('animated shell repeated close and reopen remains visible; Konami preserved', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enterLab(page);
  const launcher = page.getByRole('button', { name: 'Open lab command palette' });
  for (let i = 0; i < 3; i++) {
    await launcher.click();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(page.locator('#lab-shell')).not.toBeVisible();
  }
  await launcher.click();
  await expect(page.locator('.lab-shell-window')).toHaveCSS('opacity', '1');
  await command(page, 'nixos-rebuild switch gruvbox');
  await expect(page.locator('#lab-shell #lab-rebuild')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('#lab-rebuild')?.id)).toBe('lab-rebuild');
  await expect(page.locator('#lab-desktop')).toHaveAttribute('data-lab-theme', 'gruvbox');
  await expect(page.locator('#lab-rebuild')).not.toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#lab-shell')).not.toBeVisible();
  await page.locator('.lab-hintbar').first().click({ position: { x: 5, y: 5 } });
  for (const key of ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']) await page.keyboard.press(key);
  await expect(page.locator('#lab-desktop')).toHaveAttribute('data-lab-theme', 'nerv');
});

test('inspectors still open, tile, drag, close and reopen', async ({ page }) => {
  await enterLab(page);
  await page.getByRole('button', { name: 'Open ser5-proxmox inspector' }).click();
  const inspector = page.locator('[data-window-id="network-ser5-proxmox"]');
  await expect(inspector).toHaveAttribute('data-window-mode', 'tiled');
  const title = await inspector.locator('.lab-titlebar').boundingBox();
  if (!title) throw new Error('Missing inspector titlebar');
  await page.mouse.move(title.x + 80, title.y + 12);
  await page.mouse.down();
  await page.mouse.move(title.x + 140, title.y + 60, { steps: 5 });
  await page.mouse.up();
  await expect(inspector).toHaveAttribute('data-window-dragged', 'true');
  await inspector.locator('.lab-titlebar').dblclick();
  await expect(inspector).toHaveAttribute('data-window-mode', 'tiled');
  await page.getByRole('button', { name: 'Close ser5-proxmox inspector' }).click();
  await expect(inspector).not.toBeVisible();
  await page.getByRole('button', { name: 'Open ser5-proxmox inspector' }).click();
  await expect(inspector).toBeVisible();
});

for (const width of [400, 820]) {
  test(`calm homepage still fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('journal destinations are accessible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
  const page = await context.newPage();
  await page.goto('/lab');
  await expect(page.getByRole('link', { name: 'Setup Atuin For Shell History' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'ZFS Can Set Quotas on Datasets' })).toBeVisible();
  await context.close();
});

test('shared snapshot readings remain frozen and unavailable NAS metrics say N/A', async ({ page }) => {
  await enterLab(page);
  await page.clock.install();
  await page.getByRole('button', { name: 'Open ser5-proxmox inspector' }).click();
  const ser5 = page.locator('[data-window-id="network-ser5-proxmox"]');
  await expect(ser5).toContainText('8C / 16T');
  await expect(ser5.locator('[data-gauge-value="cpu"]')).toHaveText('2.4%');
  await page.clock.runFor(8000);
  await expect(ser5.locator('[data-gauge-value="cpu"]')).toHaveText('2.4%');
  await page.getByRole('button', { name: 'Open joseph-nas inspector' }).click();
  const nas = page.locator('[data-window-id="network-joseph-nas"]');
  await expect(nas).toContainText('2×4 TB MIRROR');
  await expect(nas.locator('[data-gauge-value="cpu"]')).toHaveText('N/A');
  await page.getByRole('tab', { name: '2:COMPUTE' }).click();
  await expect(page.getByRole('tabpanel', { name: '2:COMPUTE' })).toContainText('24 CORES / 40 THREADS');
  await expect(page.locator('[data-window-id="compute-ser5-proxmox"] [data-gauge-value="cpu"]')).toHaveText('2.4%');
});
