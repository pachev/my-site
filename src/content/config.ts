import { z, defineCollection } from 'astro:content';

// Define a schema for blog posts
// `assist` records how much AI helped write the post: none, edited (AI draft
// PJ reworked), or heavy (mostly AI output). Posts with assist != none can ship
// sibling variant files (_slug.notes.md, _slug.ai.md) that readers can toggle to.
// `promptVersion` points at the version of the writing prompt on /how-i-write.
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    assist: z.enum(['none', 'edited', 'heavy']).default('none'),
    promptVersion: z.string().optional()
  }),
});

// Define a schema for TIL (Today I Learned) posts
const tilCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  }),
});

// Define a schema for Home Lab Journal posts
const labCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  }),
});

// Define a schema for Essays
const essaysCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  }),
});

// Export a single `collections` object to register your collection(s)
export const collections = {
  'blog': blogCollection,
  'til': tilCollection,
  'lab': labCollection,
  'essays': essaysCollection,
};