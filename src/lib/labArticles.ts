import { getCollection } from 'astro:content';

// Curate destinations, while keeping titles, dates and draft status in content.
const relatedBlogSlugs = new Set([
  'nixos-proxmox-lxc-from-scratch',
  'nixos-proxmox-lxc-template',
  'setup-atuin-shell-history',
]);
const relatedTilSlugs = new Set(['zfs-quotas-on-datasets']);

export async function getLabArticles() {
  const [lab, blog, til] = await Promise.all([
    getCollection('lab', ({ data }) => !data.draft),
    getCollection('blog', ({ data }) => !data.draft),
    getCollection('til', ({ data }) => !data.draft),
  ]);
  return [
    ...lab.map((post) => ({ ...post.data, href: `/lab/${post.slug}` })),
    ...blog.filter((post) => relatedBlogSlugs.has(post.slug))
      .map((post) => ({ ...post.data, href: `/posts/${post.slug}` })),
    ...til.filter((post) => relatedTilSlugs.has(post.slug))
      .map((post) => ({ ...post.data, href: `/tils/${post.slug}` })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}
