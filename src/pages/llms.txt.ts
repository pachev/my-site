import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://pachevjoseph.com';

const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.getTime() - a.data.date.getTime();

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(byDateDesc);
  const tils = (await getCollection('til', ({ data }) => !data.draft)).sort(byDateDesc);

  const link = (path: string, title: string) => `- [${title}](${SITE}${path})`;

  const body = [
    '# Pachev Joseph',
    '',
    '> Personal site of Pachev Joseph, a software engineer who writes about backend systems, home lab tinkering, and developer tooling. Content is a mix of longer-form posts and short "Today I Learned" notes.',
    '',
    '## Posts',
    '',
    ...posts.map((p) => link(`/posts/${p.slug}`, p.data.title)),
    '',
    '## TILs',
    '',
    ...tils.map((t) => link(`/tils/${t.slug}`, t.data.title)),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
