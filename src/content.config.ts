import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const tracks = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tracks' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      composer: z.string(),
      // Public path, not an import — the mp3s live in public/audio/ so
      // /audio/wrapped.mp3 (fetched by an external app) keeps its exact
      // URL untouched by the asset pipeline. wrapped.mp3 itself is
      // deliberately not a collection entry, so it never renders here.
      audio: z.string(),
      coverImage: image(),
      // Screen-reader description of coverImage — also the per-image EU AI
      // Act Art. 50(4) disclosure for the AI-generated cover art.
      coverImageAlt: z.string(),
      // Sort order on the /audio page, ascending.
      order: z.number(),
    }),
});

export const collections = { tracks };
