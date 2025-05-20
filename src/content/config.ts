import { z, defineCollection } from 'astro:content';

// Define a schema for blog posts
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
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