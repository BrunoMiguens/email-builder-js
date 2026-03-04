import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional();

const FONT_FAMILY_SCHEMA = z
  .enum([
    'MODERN_SANS',
    'BOOK_SANS',
    'ORGANIC_SANS',
    'GEOMETRIC_SANS',
    'HEAVY_SANS',
    'ROUNDED_SANS',
    'MODERN_SERIF',
    'BOOK_SERIF',
    'MONOSPACE',
    'INTER',
  ])
  .nullable()
  .optional();

export const EmailLayoutPropsSchema = z.object({
  backdropColor: COLOR_SCHEMA,
  borderColor: COLOR_SCHEMA,
  borderRadius: z.number().optional().nullable(),
  canvasColor: COLOR_SCHEMA,
  textColor: COLOR_SCHEMA,
  fontFamily: FONT_FAMILY_SCHEMA,
  maxWidth: z.number().optional().nullable(),
  paddingVertical: z.number().optional().nullable(),
  paddingHorizontal: z.number().optional().nullable(),
  mobilePaddingVertical: z.number().optional().nullable(),
  mobilePaddingHorizontal: z.number().optional().nullable(),
  childrenIds: z.array(z.string()).optional().nullable(),
});

export type EmailLayoutProps = z.infer<typeof EmailLayoutPropsSchema>;
