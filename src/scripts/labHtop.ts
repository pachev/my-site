import snapshot from '../data/lab-processes.json';
import { NODE_DATA, COMPUTE_IDS, SNAPSHOT_LABEL } from '../data/labSnapshot';

export function renderHtop() {
  const view = document.createElement('section');
  view.className = 'lab-htop';
  view.setAttribute('aria-label', 'htop read-only resource snapshot and demo processes');
  const heading = document.createElement('h2');
  heading.textContent = 'htop // PJ LAB';
  const source = document.createElement('p');
  source.className = 'lab-htop-provenance';
  source.textContent = SNAPSHOT_LABEL;
  const sourceNote = document.createElement('p');
  sourceNote.textContent = "Host readings supplied by PJ, checked by his agent. 4 Proxmox hosts · 24 cores / 40 threads · 77.4 GiB RAM · 14 running guests. Not independently sampled here.";
  view.append(heading, source, sourceNote);
  const meters = document.createElement('div');
  meters.className = 'lab-htop-meters';
  for (const id of COMPUTE_IDS) {
    const node = NODE_DATA[id];
    const group = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = id;
    group.append(title);
    for (const metric of ['cpu', 'ram'] as const) {
      const value = node[metric]!;
      const label = document.createElement('label');
      label.textContent = `${metric.toUpperCase()} ${value}%`;
      const meter = document.createElement('meter');
      meter.min = 0;
      meter.max = 100;
      meter.value = value;
      meter.setAttribute('aria-label', `${id} ${metric} snapshot usage`);
      label.append(meter);
      group.append(label);
    }
    const uptime = document.createElement('p');
    uptime.textContent = node.foot;
    group.append(uptime);
    meters.append(group);
  }
  view.append(meters);
  const provenance = document.createElement('p');
  provenance.className = 'lab-htop-provenance';
  provenance.textContent = snapshot.label;
  const note = document.createElement('p');
  note.textContent = 'No per-process measurements were supplied. The rows below are a separate demonstration with synthetic IDs. No infrastructure connection, signals or process controls.';
  view.append(provenance, note);

  const controls = document.createElement('div');
  controls.className = 'lab-htop-controls';
  const tableRegion = document.createElement('div');
  tableRegion.className = 'lab-htop-table';
  tableRegion.tabIndex = 0;
  tableRegion.setAttribute('role', 'region');
  tableRegion.setAttribute('aria-label', 'Demo processes; scroll for all columns');
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.textContent = 'Demo processes';
  const head = document.createElement('thead');
  const headings = document.createElement('tr');
  for (const text of ['DEMO ID', 'CPU %', 'MEM %', 'STATE', 'COMMAND']) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = text;
    headings.append(cell);
  }
  head.append(headings);
  const body = document.createElement('tbody');
  table.append(caption, head, body);
  tableRegion.append(table);
  const sorts = [
    ['cpuPercent', 'Sort CPU'],
    ['memoryPercent', 'Sort memory'],
  ] as const;
  const buttons: HTMLButtonElement[] = [];
  function sortBy(key: 'cpuPercent' | 'memoryPercent') {
    const processes = [...snapshot.processes].sort((a, b) => b[key] - a[key]);
    body.replaceChildren(...processes.map((process) => {
      const row = document.createElement('tr');
      for (const value of [process.pid, process.cpuPercent.toFixed(1), process.memoryPercent.toFixed(1), process.state, process.command]) {
        const cell = document.createElement('td');
        cell.textContent = String(value);
        row.append(cell);
      }
      return row;
    }));
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(sorts[i][0] === key)));
    head.querySelectorAll('th').forEach((cell, i) => {
      if ((key === 'cpuPercent' && i === 1) || (key === 'memoryPercent' && i === 2)) cell.setAttribute('aria-sort', 'descending');
      else cell.removeAttribute('aria-sort');
    });
  }
  sorts.forEach(([key, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => sortBy(key));
    buttons.push(button);
    controls.append(button);
  });
  sortBy('cpuPercent');
  view.append(controls, tableRegion);
  return view;
}
