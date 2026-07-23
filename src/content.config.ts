import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    cats: z.array(z.string()),
    tags: z.array(z.string()),
    heroImage: z.string(),
    heroAlt: z.string(),
    author: z.string().default('Jim Blackburn'),
    nmls: z.string().default('1072866'),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
