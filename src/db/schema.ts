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

import { user } from '@agentuity/auth/schema';
import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	completed: boolean('completed').notNull().default(false),
	userId: text('userId')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const taskRelations = relations(task, ({ one }) => ({
	user: one(user, {
		fields: [task.userId],
		references: [user.id],
	}),
}));
