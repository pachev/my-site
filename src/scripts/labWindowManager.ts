import { gsap } from 'gsap';

type NodeInfo = {
  hw: string;
  platform: string;
  cpu: number;
  ram: number;
  svcs: [string, string][];
  foot: string;
};

const NODE_DATA: Record<string, NodeInfo> = {
  'security-pve': {
    hw: 'INTEL N150 · 4C · 15G · CORAL TPU (USB)',
    platform: 'PROXMOX VE 8.4 · KERNEL 6.14',
    cpu: 34,
    ram: 31,
    svcs: [['frigate', 'nixos ct 205 · 6 cameras'], ['coral-tpu', 'inference 8.1ms']],
    foot: '$ uptime → 13 days. do not jinx it.',
  },
  'ser5-proxmox': {
    hw: 'RYZEN 7 5850U · 16C · 27G',
    platform: 'PROXMOX VE 8.4 · KERNEL 6.11',
    cpu: 4,
    ram: 70,
    svcs: [['coolify', 'ships this very site'], ['home-assistant', 'vm 108'], ['adguard', 'dns for everything'], ['excalidraw', 'team whiteboard'], ['forgejo', 'ct 211 · git at home'], ['atuin', 'ct 110 · shell history'], ['metrics', 'ct 208 · victoriametrics']],
    foot: '$ uptime → 13 days. the elder node.',
  },
  'pve-ser-24gb': {
    hw: 'RYZEN 7 6800U · 16C · 19G',
    platform: 'PROXMOX VE 8.4 · KERNEL 6.8',
    cpu: 5,
    ram: 27,
    svcs: [['katzenbase', 'the second brain'], ['immich', 'nixos ct 206'], ['mast', 'lxc 200'], ['hermes-agent', 'lxc 109'], ['github-runner', 'ci, nixos ct 207']],
    foot: '$ uptime → 6 days. once took five power cycles. haunted.',
  },
  's13-proxmox': {
    hw: 'INTEL N150 · 4C · 15G',
    platform: 'PROXMOX VE 8.4 · KERNEL 6.14',
    cpu: 2,
    ram: 13,
    svcs: [['jellyfin', 'nixos ct 212 · movies + tv'], ['intel-gpu', 'hardware transcoding'], ['nas-library', 'read-only media · local ssd cache']],
    foot: '$ now playing → the spare node has a job.',
  },
  'joseph-nas': {
    hw: 'RYZEN 5 · NODE 304 · 16G · ZFS 4×HDD',
    platform: 'UBUNTU SERVER · NFS + ZFS',
    cpu: 2,
    ram: 67,
    svcs: [['nfs', '4 exports'], ['telegraf', 'vitals to victoriametrics'], ['zpool scrub', '0 errors']],
    foot: '$ uptime → 15.9 weeks. the adult in the room.',
  },
};

type RectMap = Map<HTMLElement, DOMRect>;

export function initLabWindowManager(reducedMotion: boolean) {
  const desktop = document.getElementById('lab-desktop');
  if (!desktop) return;
  const desktopRoot: HTMLElement = desktop;

  const scenes = Array.from(desktopRoot.querySelectorAll<HTMLElement>('.lab-scene'));
  const workspaceButtons = Array.from(desktopRoot.querySelectorAll<HTMLButtonElement>('.lab-ws'));
  let activeScene = scenes.find((scene) => scene.classList.contains('active')) ?? null;
  let focusedWindow: HTMLElement | null = null;
  let zIndex = 20;

  function managedWindows(scene: HTMLElement) {
    return Array.from(scene.querySelectorAll<HTMLElement>('[data-managed-window]'));
  }

  function openWindows(scene: HTMLElement) {
    return managedWindows(scene).filter((windowEl) => !windowEl.hidden);
  }

  function captureRects(scene: HTMLElement): RectMap {
    return new Map(openWindows(scene).map((windowEl) => [windowEl, windowEl.getBoundingClientRect()]));
  }

  function animateReflow(scene: HTMLElement, previousRects: RectMap) {
    if (reducedMotion) return;

    for (const windowEl of openWindows(scene)) {
      const previous = previousRects.get(windowEl);
      if (!previous) continue;
      const next = windowEl.getBoundingClientRect();
      const x = previous.left - next.left;
      const y = previous.top - next.top;
      if (Math.abs(x) < 1 && Math.abs(y) < 1) continue;
      gsap.fromTo(windowEl, { x, y }, { x: 0, y: 0, duration: 0.28, ease: 'power2.out', overwrite: true });
    }
  }

  function focusWindow(windowEl: HTMLElement) {
    const scene = windowEl.closest<HTMLElement>('.lab-scene') ?? desktopRoot;
    managedWindows(scene).forEach((candidate) => {
      candidate.classList.toggle('lab-window-focused', candidate === windowEl);
    });
    scene.querySelectorAll<HTMLElement>('[data-open-node]').forEach((launcher) => {
      const selected = launcher.dataset.openNode === windowEl.dataset.node;
      launcher.classList.toggle('lab-node-selected', selected);
      launcher.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    windowEl.style.zIndex = String(++zIndex);
    focusedWindow = windowEl;
  }

  function tileOpenWindows(scene: HTMLElement, previousRects = captureRects(scene)) {
    const windows = openWindows(scene);

    if (windows.length > 1) {
      windows.forEach((windowEl) => {
        if (windowEl.dataset.windowDragged !== 'true') {
          windowEl.dataset.windowMode = 'tiled';
          windowEl.removeAttribute('style');
        }
      });
    } else if (windows.length === 1 && scene.dataset.scene === '1' && windows[0].dataset.windowDragged !== 'true') {
      windows[0].dataset.windowMode = 'floating';
    }

    requestAnimationFrame(() => animateReflow(scene, previousRects));
  }

  function closeWindow(windowEl: HTMLElement) {
    const scene = windowEl.closest<HTMLElement>('.lab-scene');
    if (!scene || windowEl.hidden) return;
    const previousRects = captureRects(scene);

    const finish = () => {
      windowEl.hidden = true;
      gsap.set(windowEl, { clearProps: 'opacity,scale,x,y' });
      windowEl.classList.remove('lab-window-focused');
      if (focusedWindow === windowEl) focusedWindow = null;
      tileOpenWindows(scene, previousRects);
      const nextWindow = openWindows(scene).at(-1);
      if (nextWindow) {
        focusWindow(nextWindow);
      } else {
        scene.querySelectorAll<HTMLElement>('[data-open-node]').forEach((launcher) => {
          launcher.classList.remove('lab-node-selected');
          launcher.setAttribute('aria-pressed', 'false');
        });
      }
    };

    if (reducedMotion) {
      finish();
      return;
    }

    gsap.to(windowEl, { opacity: 0, scale: 0.96, duration: 0.16, ease: 'power2.in', onComplete: finish });
  }

  function openWindow(windowEl: HTMLElement) {
    const scene = windowEl.closest<HTMLElement>('.lab-scene');
    if (!scene) return;

    if (!windowEl.hidden) {
      focusWindow(windowEl);
      return;
    }

    const previousRects = captureRects(scene);
    windowEl.hidden = false;
    const windows = openWindows(scene);
    if (windows.length > 1) {
      windows.forEach((candidate) => {
        if (candidate.dataset.windowDragged === 'true') return;
        candidate.dataset.windowMode = 'tiled';
        candidate.removeAttribute('style');
      });
    } else {
      windowEl.dataset.windowMode = scene.dataset.scene === '1' ? 'floating' : 'tiled';
    }
    focusWindow(windowEl);

    requestAnimationFrame(() => {
      animateReflow(scene, previousRects);
      if (!reducedMotion) {
        gsap.fromTo(windowEl, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(1.7)', clearProps: 'opacity,scale' });
      }
    });
  }

  function fillInspector(windowEl: HTMLElement, nodeId: string) {
    const info = NODE_DATA[nodeId];
    if (!info) return;

    windowEl.dataset.node = nodeId;
    windowEl.dataset.windowId = `network-${nodeId}`;
    const title = windowEl.querySelector<HTMLElement>('[data-window-title]');
    const hw = windowEl.querySelector<HTMLElement>('[data-inspector-hw]');
    const platform = windowEl.querySelector<HTMLElement>('[data-inspector-platform]');
    const services = windowEl.querySelector<HTMLElement>('[data-inspector-services]');
    const foot = windowEl.querySelector<HTMLElement>('[data-inspector-foot]');
    const closeButton = windowEl.querySelector<HTMLButtonElement>('[data-window-close]');

    if (title) title.textContent = `${nodeId} — node inspector`;
    if (hw) hw.textContent = info.hw;
    if (platform) platform.textContent = info.platform;
    if (closeButton) closeButton.setAttribute('aria-label', `Close ${nodeId} inspector`);
    if (services) {
      services.replaceChildren();
      if (info.svcs.length === 0) {
        const idle = document.createElement('div');
        idle.className = 'lab-idle-msg';
        idle.textContent = 'NONE. IDLE // AWAITING PURPOSE';
        services.appendChild(idle);
      } else {
        info.svcs.forEach(([name, note]) => {
          const row = document.createElement('div');
          row.className = 'lab-svc';
          const dot = document.createElement('span');
          dot.className = 'lab-dot';
          const noteEl = document.createElement('span');
          noteEl.className = 'lab-svc-note';
          noteEl.textContent = note;
          row.append(dot, document.createTextNode(` ${name} `), noteEl);
          services.appendChild(row);
        });
      }
    }
    if (foot) {
      foot.replaceChildren(document.createTextNode(info.foot));
      const caret = document.createElement('span');
      caret.className = 'lab-caret';
      caret.textContent = '▮';
      foot.appendChild(caret);
    }
    updateTelemetry(windowEl, info.cpu, info.ram, false);
  }

  function createNetworkInspector(nodeId: string) {
    const scene = desktopRoot.querySelector<HTMLElement>('.lab-network');
    const layer = scene?.querySelector<HTMLElement>('[data-window-layer]');
    const template = document.getElementById('lab-node-inspector-template') as HTMLTemplateElement | null;
    if (!scene || !layer || !template) return null;

    const existing = scene.querySelector<HTMLElement>(`[data-window-id="network-${nodeId}"]`);
    if (existing) return existing;

    const windowEl = template.content.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
    if (!windowEl) return null;
    fillInspector(windowEl, nodeId);
    layer.appendChild(windowEl);
    bindWindow(windowEl);
    return windowEl;
  }

  function openNode(nodeId: string, source: HTMLElement) {
    const scene = source.closest<HTMLElement>('.lab-scene');
    if (!scene || !NODE_DATA[nodeId]) return;

    let windowEl: HTMLElement | null;
    if (scene.dataset.scene === '1') {
      windowEl = createNetworkInspector(nodeId);
    } else {
      windowEl = scene.querySelector<HTMLElement>(`[data-node="${nodeId}"][data-managed-window]`);
    }
    if (windowEl) openWindow(windowEl);
  }

  function updateTelemetry(windowEl: HTMLElement, cpu: number, ram: number, animate = true) {
    const values = { cpu, ram };
    (['cpu', 'ram'] as const).forEach((metric) => {
      const fill = windowEl.querySelector<HTMLElement>(`[data-gauge-fill="${metric}"]`);
      const label = windowEl.querySelector<HTMLElement>(`[data-gauge-value="${metric}"]`);
      if (label) label.textContent = `${values[metric]}%`;
      if (!fill) return;
      if (animate && !reducedMotion) {
        gsap.to(fill, { width: `${values[metric]}%`, duration: 0.5, ease: 'power1.inOut', overwrite: true });
      } else {
        fill.style.width = `${values[metric]}%`;
      }
    });
  }

  function wiggleTelemetry() {
    if (reducedMotion || document.hidden) return;
    desktopRoot.querySelectorAll<HTMLElement>('[data-managed-window]:not([hidden])[data-node]').forEach((windowEl) => {
      const info = NODE_DATA[windowEl.dataset.node ?? ''];
      if (!info) return;
      const cpu = Math.max(1, Math.min(99, info.cpu + Math.round(Math.random() * 6 - 3)));
      const ram = Math.max(1, Math.min(99, info.ram + Math.round(Math.random() * 4 - 2)));
      updateTelemetry(windowEl, cpu, ram);
    });
  }

  function bindDrag(windowEl: HTMLElement) {
    const titlebar = windowEl.querySelector<HTMLElement>('.lab-titlebar');
    if (!titlebar) return;

    titlebar.addEventListener('dblclick', (event) => {
      if ((event.target as HTMLElement).closest('[data-window-close]')) return;
      const scene = windowEl.closest<HTMLElement>('.lab-scene');
      if (!scene) return;
      const previousRects = captureRects(scene);
      windowEl.dataset.windowMode = 'tiled';
      delete windowEl.dataset.windowDragged;
      windowEl.removeAttribute('style');
      requestAnimationFrame(() => animateReflow(scene, previousRects));
    });

    titlebar.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || (event.target as HTMLElement).closest('[data-window-close]')) return;
      const layer = windowEl.closest<HTMLElement>('[data-window-layer]');
      const scene = windowEl.closest<HTMLElement>('.lab-scene');
      if (!layer || !scene) return;

      event.preventDefault();
      focusWindow(windowEl);
      const previousRects = captureRects(scene);
      const windowRect = windowEl.getBoundingClientRect();
      const layerRect = layer.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = windowRect.left - layerRect.left;
      const startTop = windowRect.top - layerRect.top;

      gsap.killTweensOf(windowEl);
      gsap.set(windowEl, { clearProps: 'x,y,transform' });
      windowEl.dataset.windowMode = 'floating';
      windowEl.dataset.windowDragged = 'true';
      Object.assign(windowEl.style, {
        left: `${startLeft}px`,
        top: `${startTop}px`,
        width: `${windowRect.width}px`,
        height: `${windowRect.height}px`,
      });
      titlebar.setPointerCapture(event.pointerId);
      animateReflow(scene, previousRects);

      const move = (moveEvent: PointerEvent) => {
        const maxLeft = Math.max(0, layer.clientWidth - windowEl.offsetWidth);
        const maxTop = Math.max(0, layer.clientHeight - titlebar.offsetHeight);
        const left = Math.max(0, Math.min(maxLeft, startLeft + moveEvent.clientX - startX));
        const top = Math.max(0, Math.min(maxTop, startTop + moveEvent.clientY - startY));
        windowEl.style.left = `${left}px`;
        windowEl.style.top = `${top}px`;
      };

      const stop = () => {
        titlebar.removeEventListener('pointermove', move);
        titlebar.removeEventListener('pointerup', stop);
        titlebar.removeEventListener('pointercancel', stop);
      };

      titlebar.addEventListener('pointermove', move);
      titlebar.addEventListener('pointerup', stop);
      titlebar.addEventListener('pointercancel', stop);
    });
  }

  function bindWindow(windowEl: HTMLElement) {
    windowEl.addEventListener('pointerdown', () => focusWindow(windowEl));
    windowEl.querySelector<HTMLElement>('[data-window-close]')?.addEventListener('click', () => closeWindow(windowEl));
    bindDrag(windowEl);
  }

  function activateWorkspace(id: string) {
    const incoming = scenes.find((scene) => scene.dataset.scene === id);
    const outgoing = activeScene;
    if (!incoming || incoming === outgoing) return;
    activeScene = incoming;

    scenes.forEach((scene) => {
      if (scene === incoming || scene === outgoing) return;
      scene.classList.remove('active');
      gsap.set(scene, { clearProps: 'transform,opacity' });
    });

    workspaceButtons.forEach((button) => {
      const active = button.dataset.workspace === id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const incomingFocused = incoming.querySelector<HTMLElement>('.lab-window-focused:not([hidden])') ?? openWindows(incoming)[0];
    if (incomingFocused) focusWindow(incomingFocused);

    if (!outgoing || reducedMotion) {
      outgoing?.classList.remove('active');
      incoming.classList.add('active');
      return;
    }

    const direction = Number(id) > Number(outgoing.dataset.scene) ? 1 : -1;
    gsap.killTweensOf([outgoing, incoming]);
    incoming.classList.add('active');
    gsap.fromTo(incoming, { xPercent: direction * 4, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.24, ease: 'power2.out', clearProps: 'transform,opacity' });
    gsap.to(outgoing, {
      xPercent: direction * -4,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        outgoing.classList.remove('active');
        gsap.set(outgoing, { clearProps: 'transform,opacity' });
      },
    });
  }

  workspaceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.workspace) activateWorkspace(button.dataset.workspace);
    });
  });

  desktopRoot.querySelectorAll<HTMLElement>('[data-open-node]').forEach((launcher) => {
    launcher.addEventListener('click', () => {
      if (launcher.dataset.openNode) openNode(launcher.dataset.openNode, launcher);
    });
  });

  desktopRoot.querySelectorAll<HTMLElement>('[data-managed-window]').forEach(bindWindow);

  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

    if (!event.metaKey && !event.ctrlKey && !event.altKey && ['1', '2', '3', '4'].includes(event.key)) {
      activateWorkspace(event.key);
    }

    if (event.metaKey && event.key.toLowerCase() === 'q' && focusedWindow) {
      event.preventDefault();
      closeWindow(focusedWindow);
    }
  });

  const initialWindow = desktopRoot.querySelector<HTMLElement>('[data-window-id="network-security-pve"]');
  if (initialWindow) focusWindow(initialWindow);
  window.setInterval(wiggleTelemetry, 1800);
}
