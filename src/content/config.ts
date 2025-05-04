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

// Export a single `collections` object to register your collection(s)
export const collections = {
  'blog': blogCollection,
};