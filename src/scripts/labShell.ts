import { gsap } from 'gsap';

const THEMES = ['sage', 'gruvbox', 'tokyo-night', 'nerv'] as const;
type LabTheme = (typeof THEMES)[number];

const THEME_LABELS: Record<LabTheme, string> = {
  sage: 'SAGE',
  gruvbox: 'GRUVBOX',
  'tokyo-night': 'TOKYO NIGHT',
  nerv: 'NERV',
};

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

type ShellMetadata = {
  astroVersion: string;
  buildDate: string;
  gitCommit: string;
};

type OutputTone = 'normal' | 'muted' | 'success' | 'warn' | 'error';

export function initLabShell(reducedMotion: boolean) {
  const desktop = document.getElementById('lab-desktop');
  const shell = document.getElementById('lab-shell');
  const input = shell?.querySelector<HTMLInputElement>('[data-shell-input]');
  const form = shell?.querySelector<HTMLFormElement>('[data-shell-form]');
  const output = shell?.querySelector<HTMLElement>('[data-shell-output]');
  const rebuild = document.getElementById('lab-rebuild');
  const rebuildTheme = rebuild?.querySelector<HTMLElement>('[data-rebuild-theme]');
  const rebuildProgress = rebuild?.querySelector<HTMLElement>('[data-rebuild-progress]');
  const rebuildLog = rebuild?.querySelector<HTMLElement>('[data-rebuild-log]');
  const konamiAlert = document.getElementById('lab-konami');

  if (!desktop || !shell || !input || !form || !output || !rebuild || !rebuildTheme || !rebuildProgress || !rebuildLog || !konamiAlert) return;

  const root: HTMLElement = desktop;
  const shellRoot: HTMLElement = shell;
  const shellInput: HTMLInputElement = input;
  const shellOutput: HTMLElement = output;
  const rebuildRoot: HTMLElement = rebuild;
  const rebuildThemeEl: HTMLElement = rebuildTheme;
  const rebuildProgressEl: HTMLElement = rebuildProgress;
  const rebuildLogEl: HTMLElement = rebuildLog;
  const konamiRoot: HTMLElement = konamiAlert;
  const metadata: ShellMetadata = {
    astroVersion: shellRoot.dataset.astroVersion ?? 'unknown',
    buildDate: shellRoot.dataset.buildDate ?? 'unknown',
    gitCommit: shellRoot.dataset.gitCommit ?? 'unknown',
  };

  let activeTheme: LabTheme = 'sage';
  let lastFocused: HTMLElement | null = null;
  let rebuilding = false;
  let historyIndex = 0;
  const history: string[] = [];
  const konamiBuffer: string[] = [];

  function appendLine(text: string, tone: OutputTone = 'normal') {
    const line = document.createElement('div');
    line.className = `lab-shell-line lab-shell-${tone}`;
    line.textContent = text;
    shellOutput.appendChild(line);
    shellOutput.scrollTop = shellOutput.scrollHeight;
  }

  function appendBlock(text: string, tone: OutputTone = 'normal') {
    const block = document.createElement('pre');
    block.className = `lab-shell-block lab-shell-${tone}`;
    block.textContent = text;
    shellOutput.appendChild(block);
    shellOutput.scrollTop = shellOutput.scrollHeight;
  }

  function echoCommand(command: string) {
    const line = document.createElement('div');
    line.className = 'lab-shell-line lab-shell-echo';
    const prompt = document.createElement('span');
    prompt.className = 'lab-shell-prompt-inline';
    prompt.textContent = 'pj@lab ~ $ ';
    line.append(prompt, document.createTextNode(command));
    shellOutput.appendChild(line);
  }

  function setTheme(theme: LabTheme) {
    activeTheme = theme;
    root.dataset.labTheme = theme;
  }

  function nextTheme() {
    const index = THEMES.indexOf(activeTheme);
    return THEMES[(index + 1) % THEMES.length];
  }

  function parseThemeArgument(raw: string): LabTheme | null {
    let value = raw.trim().toLowerCase();
    if (!value) return nextTheme();
    value = value.replace(/^--flake\s+/, '').replace(/^\.\//, '').replace(/^\.?#/, '');
    value = value.replace(/^--theme(?:=|\s+)/, '');
    if (value === 'tokyo' || value === 'tokyonight') value = 'tokyo-night';
    return THEMES.includes(value as LabTheme) ? value as LabTheme : null;
  }

  function renderHelp() {
    appendBlock([
      'AVAILABLE COMMANDS',
      '  help                                  show this list',
      '  fastfetch | neofetch                  identify this machine',
      '  sudo rm -rf /                         absolutely do not',
      '  sudo pacman -S personality            install missing personality',
      '  nixos-rebuild switch [theme]           rebuild; no theme cycles',
      '  nixos-rebuild switch --flake .#nerv   target a lab profile',
      '  clear                                 clear the terminal',
      '',
      'THEMES  sage · gruvbox · tokyo-night · nerv',
      'HOTKEYS SPACE open · ESC close · ↑/↓ history',
    ].join('\n'), 'muted');
  }

  function renderFastfetch() {
    appendBlock([
      '       ___       PJ@LAB',
      '   ___/ _ \\___   ─────────────────────────',
      '  / _  /_/ / _ \\  OS      PJ Lab Desktop',
      '  \\_,_/ .__/\___/  HOST    pachevjoseph.com',
      '     /_/          STACK   Astro + TypeScript + GSAP',
      `                  ASTRO   ${metadata.astroVersion}`,
      `                  BUILT   ${metadata.buildDate}`,
      `                  COMMIT  ${metadata.gitCommit}`,
      `                  THEME   ${THEME_LABELS[activeTheme]}`,
      '                  WM      suspiciously functional',
    ].join('\n'), 'success');
  }

  function finishRebuild(theme: LabTheme) {
    rebuildRoot.hidden = true;
    rebuilding = false;
    gsap.set(rebuildRoot, { clearProps: 'opacity,filter' });
    gsap.set(rebuildProgressEl, { clearProps: 'width' });
    appendLine(`switching to configuration ${THEME_LABELS[theme]}... done`, 'success');
    appendLine('warning: 0 packages changed, 100% more personality detected', 'warn');
  }

  function runRebuild(theme: LabTheme) {
    if (rebuilding) {
      appendLine('error: a rebuild is already doing something dramatic', 'error');
      return;
    }

    rebuilding = true;
    rebuildThemeEl.textContent = THEME_LABELS[theme];
    rebuildLogEl.textContent = 'evaluating flake...';
    rebuildRoot.hidden = false;
    gsap.set(rebuildProgressEl, { width: '0%' });

    if (reducedMotion) {
      setTheme(theme);
      rebuildLogEl.textContent = 'configuration switched (cinematics disabled)';
      finishRebuild(theme);
      return;
    }

    const timeline = gsap.timeline({ onComplete: () => finishRebuild(theme) });
    timeline
      .fromTo(rebuildRoot, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'none' })
      .to(rebuildProgressEl, { width: '18%', duration: 0.2, ease: 'steps(3)' })
      .call(() => { rebuildLogEl.textContent = 'building /nix/store/pj-lab-personality.drv...'; })
      .to(rebuildProgressEl, { width: '46%', duration: 0.28, ease: 'steps(5)' })
      .call(() => { rebuildLogEl.textContent = 'stopping graphical-session.target... probably fine'; })
      .to(root, { x: -8, duration: 0.05, yoyo: true, repeat: 5, ease: 'none' })
      .to(rebuildProgressEl, { width: '73%', duration: 0.3, ease: 'steps(4)' }, '<')
      .call(() => {
        setTheme(theme);
        rebuildLogEl.textContent = `activating ${THEME_LABELS[theme]} specialisation...`;
      })
      .to(rebuildRoot, { filter: 'brightness(2.8) contrast(1.4)', duration: 0.08, yoyo: true, repeat: 3 })
      .to(rebuildProgressEl, { width: '100%', duration: 0.36, ease: 'power2.out' })
      .call(() => { rebuildLogEl.textContent = 'restarting vibes.service... done'; })
      .to(rebuildRoot, { opacity: 0, duration: 0.24, delay: 0.32, ease: 'power2.in' });
  }

  function execute(command: string) {
    const normalized = command.trim().replace(/\s+/g, ' ');
    if (!normalized) return;
    echoCommand(normalized);

    if (normalized === 'help') {
      renderHelp();
      return;
    }
    if (normalized === 'clear') {
      shellOutput.replaceChildren();
      return;
    }
    if (normalized === 'fastfetch' || normalized === 'neofetch') {
      renderFastfetch();
      return;
    }
    if (/^sudo rm -rf \/(?: --no-preserve-root)?$/.test(normalized)) {
      appendLine('nice try.', 'error');
      return;
    }
    if (normalized === 'sudo pacman -S personality') {
      appendLine('error: target not found: personality', 'error');
      appendLine('hint: already installed', 'success');
      return;
    }

    const rebuildPrefix = 'nixos-rebuild switch';
    if (normalized === rebuildPrefix || normalized.startsWith(`${rebuildPrefix} `)) {
      const theme = parseThemeArgument(normalized.slice(rebuildPrefix.length));
      if (!theme) {
        appendLine('error: unknown lab profile', 'error');
        appendLine(`available: ${THEMES.join(' · ')}`, 'muted');
        return;
      }
      runRebuild(theme);
      return;
    }

    appendLine(`command not found: ${normalized.split(' ')[0]}`, 'error');
    appendLine('type help before you hurt yourself', 'muted');
  }

  function openShell() {
    if (!shellRoot.hidden) return;
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    shellRoot.hidden = false;
    if (!reducedMotion) {
      gsap.fromTo(shellRoot.querySelector('.lab-shell-window'), { opacity: 0, y: -18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: 'back.out(1.5)', clearProps: 'opacity,transform' });
    }
    requestAnimationFrame(() => shellInput.focus());
  }

  function closeShell() {
    if (shellRoot.hidden) return;
    const finish = () => {
      shellRoot.hidden = true;
      shellInput.value = '';
      lastFocused?.focus();
    };
    if (reducedMotion) {
      finish();
      return;
    }
    gsap.to(shellRoot.querySelector('.lab-shell-window'), { opacity: 0, y: -10, scale: 0.98, duration: 0.13, ease: 'power2.in', onComplete: finish });
  }

  function triggerKonami() {
    setTheme('nerv');
    konamiRoot.hidden = false;

    if (reducedMotion) {
      window.setTimeout(() => { konamiRoot.hidden = true; }, 1500);
      return;
    }

    gsap.timeline({ onComplete: () => { konamiRoot.hidden = true; } })
      .fromTo(konamiRoot, { opacity: 0 }, { opacity: 1, duration: 0.08 })
      .fromTo(root, { x: -6 }, { x: 6, duration: 0.04, repeat: 9, yoyo: true, ease: 'none' }, '<')
      .to(konamiRoot, { opacity: 0, duration: 0.22, delay: 1.5 });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = shellInput.value;
    if (command.trim()) {
      history.push(command);
      historyIndex = history.length;
    }
    shellInput.value = '';
    execute(command);
  });

  shellInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      shellInput.value = history[historyIndex] ?? '';
    } else if (event.key === 'ArrowDown' && history.length) {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      shellInput.value = history[historyIndex] ?? '';
    }
  });

  shellRoot.querySelectorAll<HTMLElement>('[data-shell-close]').forEach((button) => {
    button.addEventListener('click', closeShell);
  });
  root.querySelector<HTMLElement>('[data-shell-open]')?.addEventListener('click', openShell);

  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    const editable = target?.matches('input, textarea, select, [contenteditable="true"]') ?? false;

    if (event.key === 'Escape' && !shellRoot.hidden) {
      event.preventDefault();
      closeShell();
      return;
    }

    if (event.code === 'Space' && shellRoot.hidden && !editable) {
      const boot = document.getElementById('lab-boot');
      if (boot && !boot.hidden) return;
      event.preventDefault();
      openShell();
    }

    if (!editable) {
      konamiBuffer.push(event.key.toLowerCase());
      if (konamiBuffer.length > KONAMI.length) konamiBuffer.shift();
      if (konamiBuffer.length === KONAMI.length && konamiBuffer.every((key, index) => key === KONAMI[index])) {
        konamiBuffer.length = 0;
        triggerKonami();
      }
    }
  });
}
