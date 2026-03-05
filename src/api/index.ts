import { mountAuthRoutes } from '@agentuity/auth';
import { createRouter } from '@agentuity/runtime';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth, authMiddleware } from '../auth';
import { db } from '../db';
import { task } from '../db/schema';

const api = createRouter();

// Temporary compatibility export for stale generated route types.
export const StateSchema = z.object({
	history: z.array(z.any()),
	threadId: z.string().nullable().optional(),
	translationCount: z.number(),
});

api.on(['GET', 'POST'], '/auth/*', mountAuthRoutes(auth));

api.get('/tasks', authMiddleware, async (c) => {
	const user = await c.var.auth.getUser();

	if (!user) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const tasks = await db
		.select()
		.from(task)
		.where(eq(task.userId, user.id))
		.orderBy(desc(task.createdAt));

	return c.json({ tasks });
});

api.post('/tasks', authMiddleware, async (c) => {
	const user = await c.var.auth.getUser();

	if (!user) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const body = await c.req.json<{ title?: string }>();
	const title = body.title?.trim();

	if (!title) {
		return c.json({ error: 'Title is required' }, 400);
	}

	const [newTask] = await db
		.insert(task)
		.values({
			title,
			userId: user.id,
		})
		.returning();

	return c.json({ task: newTask }, 201);
});

api.patch('/tasks/:id', authMiddleware, async (c) => {
	const user = await c.var.auth.getUser();

	if (!user) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const id = c.req.param('id');
	const body = await c.req.json<{ completed?: boolean }>();

	if (typeof body.completed !== 'boolean') {
		return c.json({ error: 'completed must be a boolean' }, 400);
	}

	const [updatedTask] = await db
		.update(task)
		.set({
			completed: body.completed,
			updatedAt: new Date(),
		})
		.where(and(eq(task.id, id), eq(task.userId, user.id)))
		.returning();

	if (!updatedTask) {
		return c.json({ error: 'Task not found' }, 404);
	}

	return c.json({ task: updatedTask });
});

api.delete('/tasks/:id', authMiddleware, async (c) => {
	const user = await c.var.auth.getUser();

	if (!user) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const id = c.req.param('id');

	const [deletedTask] = await db
		.delete(task)
		.where(and(eq(task.id, id), eq(task.userId, user.id)))
		.returning({ id: task.id });

	if (!deletedTask) {
		return c.json({ error: 'Task not found' }, 404);
	}

	return c.json({ success: true });
});

export default api;
