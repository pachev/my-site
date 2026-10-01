// User-supplied snapshot checked by PJ's agent, not independently sampled here.
// Public inventory only. No infrastructure endpoints, credentials or operational faults.
export const SNAPSHOT_LABEL = 'SNAPSHOT · OCT 01 2026 · 08:30–08:37 CDT · NOT LIVE';
export type NodeInfo = {
  hw: string;
  platform: string;
  cpu: number | null;
  ram: number | null;
  svcs: [string, string][];
  foot: string;
  summary: string;
};
export const NODE_DATA: Record<string, NodeInfo> = {
  'ser5-proxmox': {
    hw: 'RYZEN 7 5850U · 8C / 16T · 27G', platform: 'PROXMOX',
    cpu: 2.4, ram: 69.1, foot: 'Snapshot uptime: 55.4 days', summary: 'COOLIFY · HOME ASSISTANT',
    svcs: [['coolify', 'ships this site'], ['home-assistant', 'home automation'], ['atuin', 'shell history'], ['metrics', 'victoriametrics'], ['adguard', 'dns'], ['forgejo', 'git at home']],
  },
  'pve-ser-24gb': {
    hw: 'RYZEN 7 6800U · 8C / 16T · 19G', platform: 'PROXMOX',
    cpu: 2.3, ram: 32.6, foot: 'Snapshot uptime: 41.9 days', summary: 'KATZENBASE · IMMICH · CI',
    svcs: [['katzenbase', 'the second brain'], ['hermes-agent', 'agent'], ['immich', 'photo library'], ['github-runner', 'ci'], ['pocket-id', 'identity'], ['audiobookshelf', 'audiobooks']],
  },
  'security-pve': {
    hw: 'INTEL N150 · 4C / 4T · 15G · CORAL TPU', platform: 'PROXMOX',
    cpu: 22.1, ram: 21.1, foot: 'Snapshot uptime: 2.7 days', summary: 'FRIGATE',
    svcs: [['frigate', '6 cameras processing frames'], ['coral-tpu', '26.6–28.6ms · 2 samples']],
  },
  's13-proxmox': {
    hw: 'INTEL N150 · 4C / 4T · 15G', platform: 'PROXMOX',
    cpu: 0.9, ram: 19.4, foot: 'Snapshot uptime: 51.8 days', summary: 'JELLYFIN · MOVIES + TV',
    svcs: [['jellyfin', '10.11.11 · movies + tv'], ['intel-gpu', 'hardware transcoding'], ['nas-library', 'read-only media']],
  },
  'joseph-nas': {
    hw: 'RYZEN 5 · NODE 304 · ZFS 2×4 TB MIRROR', platform: 'UBUNTU SERVER · NFS + ZFS',
    cpu: null, ram: null, foot: 'Resource readings not supplied', summary: '6 NFS EXPORT PATHS',
    svcs: [['nfs', '6 export paths · 4 Proxmox storage definitions'], ['telegraf', 'NAS metrics'], ['zfs', '61% allocated']],
  },
};
export const COMPUTE_IDS = ['ser5-proxmox', 'pve-ser-24gb', 'security-pve', 's13-proxmox'];
