/**
 * Database schema.
 *
 * Re-exports all auth tables from @agentuity/auth/schema.
 * Add your own application tables below.
 */

// Auth tables: user, session, account, verification, organization,
// member, invitation, jwks, apikey (+ relations)
export * from '@agentuity/auth/schema';

// =============================================================================
// Application Tables
// =============================================================================
// Add your own Drizzle tables here. They will be included in migrations
// alongside the auth tables.
//
// Example:
// import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
//
// export const post = pgTable('post', {
//   id: text('id').primaryKey(),
//   title: text('title').notNull(),
//   content: text('content'),
//   authorId: text('authorId').notNull().references(() => user.id),
//   createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
// });
