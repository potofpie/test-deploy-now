import type { AuthClient } from '@agentuity/auth/react';
import { useAuth } from '@agentuity/auth/react';
import { useAPI } from '@agentuity/react';
import { useCallback, useMemo, useState } from 'react';
import './App.css';

interface Task {
	id: string;
	title: string;
	completed: boolean;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

interface AuthenticatedUser {
	name?: string | null;
	email: string;
}

export function App() {
	const { user, isPending, isAuthenticated, authClient } = useAuth();

	if (isPending) {
		return <LoadingScreen />;
	}

	if (!isAuthenticated || !user) {
		return <AuthScreen authClient={authClient} />;
	}

	return <TasksScreen user={user as AuthenticatedUser} authClient={authClient} />;
}

function AppLogo() {
	return (
		<svg
			aria-hidden="true"
			className="h-auto w-12"
			fill="none"
			height="191"
			viewBox="0 0 220 191"
			width="220"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				clipRule="evenodd"
				d="M220 191H0L31.427 136.5H0L8 122.5H180.5L220 191ZM47.5879 136.5L24.2339 177H195.766L172.412 136.5H47.5879Z"
				fill="var(--color-cyan-500)"
				fillRule="evenodd"
			/>
			<path
				clipRule="evenodd"
				d="M110 0L157.448 82.5H189L197 96.5H54.5L110 0ZM78.7021 82.5L110 28.0811L141.298 82.5H78.7021Z"
				fill="var(--color-cyan-500)"
				fillRule="evenodd"
			/>
		</svg>
	);
}

function LoadingScreen() {
	return (
		<div className="text-white flex font-sans justify-center min-h-screen">
			<div className="flex flex-col gap-6 max-w-xl p-16 w-full items-center text-center">
				<AppLogo />
				<h1 className="text-4xl font-thin">Loading</h1>
				<p className="text-gray-500" data-loading="true">
					Checking your session
				</p>
			</div>
		</div>
	);
}

function AuthScreen({ authClient }: { authClient: AuthClient }) {
	const [mode, setMode] = useState<'signin' | 'signup'>('signin');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isSignUp = mode === 'signup';

	const handleSubmit = useCallback(async () => {
		setError(null);
		setIsSubmitting(true);

		try {
			if (isSignUp) {
				const result = await authClient.signUp.email({
					name: name.trim(),
					email: email.trim(),
					password,
				});

				if (result.error) {
					setError(result.error.message ?? 'Unable to sign up.');
				}
			} else {
				const result = await authClient.signIn.email({
					email: email.trim(),
					password,
				});

				if (result.error) {
					setError(result.error.message ?? 'Unable to sign in.');
				}
			}
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: 'Something went wrong. Please try again.'
			);
		} finally {
			setIsSubmitting(false);
		}
	}, [authClient, email, isSignUp, name, password]);

	return (
		<div className="text-white flex font-sans justify-center min-h-screen">
			<div className="flex flex-col gap-8 max-w-xl p-16 w-full">
				<div className="items-center flex flex-col gap-3 justify-center text-center">
					<AppLogo />
					<h1 className="text-5xl font-thin">Task Dashboard</h1>
					<p className="text-gray-400 text-lg">
						Sign in to manage your tasks, or create a new account.
					</p>
				</div>

				<div className="bg-black border border-gray-900 rounded-lg p-8 shadow-2xl flex flex-col gap-5">
					<div className="items-center flex bg-gray-950 border border-gray-800 rounded-md p-1">
						<button
							className="cursor-pointer rounded-sm px-3 py-2 text-sm transition-colors data-[active=true]:bg-gray-900 data-[active=true]:text-white text-gray-400"
							onClick={() => {
								setMode('signin');
								setError(null);
							}}
							type="button"
							data-active={mode === 'signin'}
						>
							Sign In
						</button>
						<button
							className="cursor-pointer rounded-sm px-3 py-2 text-sm transition-colors data-[active=true]:bg-gray-900 data-[active=true]:text-white text-gray-400"
							onClick={() => {
								setMode('signup');
								setError(null);
							}}
							type="button"
							data-active={mode === 'signup'}
						>
							Sign Up
						</button>
					</div>

					{isSignUp && (
						<label className="flex flex-col gap-2 text-sm">
							<span className="text-gray-300">Name</span>
							<input
								className="bg-gray-950 border border-gray-800 rounded-md text-white py-2.5 px-3 focus:outline-cyan-500 focus:outline-2 focus:outline-offset-2"
								disabled={isSubmitting}
								onChange={(e) => setName(e.currentTarget.value)}
								placeholder="Ada Lovelace"
								type="text"
								value={name}
							/>
						</label>
					)}

					<label className="flex flex-col gap-2 text-sm">
						<span className="text-gray-300">Email</span>
						<input
							className="bg-gray-950 border border-gray-800 rounded-md text-white py-2.5 px-3 focus:outline-cyan-500 focus:outline-2 focus:outline-offset-2"
							disabled={isSubmitting}
							onChange={(e) => setEmail(e.currentTarget.value)}
							placeholder="you@example.com"
							type="email"
							value={email}
						/>
					</label>

					<label className="flex flex-col gap-2 text-sm">
						<span className="text-gray-300">Password</span>
						<input
							className="bg-gray-950 border border-gray-800 rounded-md text-white py-2.5 px-3 focus:outline-cyan-500 focus:outline-2 focus:outline-offset-2"
							disabled={isSubmitting}
							onChange={(e) => setPassword(e.currentTarget.value)}
							placeholder="••••••••"
							type="password"
							value={password}
						/>
					</label>

					{error && (
						<div className="bg-red-950/40 border border-red-900 text-red-300 text-sm rounded-md py-2.5 px-3">
							{error}
						</div>
					)}

					<div className="relative group ml-auto">
						<div className="absolute inset-0 bg-linear-to-r from-cyan-700 via-blue-500 to-purple-600 rounded-lg blur-xl opacity-75 group-hover:blur-2xl group-hover:opacity-100 transition-all duration-700" />
						<div className="absolute inset-0 bg-cyan-500/50 rounded-lg blur-3xl opacity-50" />
						<button
							className="relative font-semibold text-white px-4 py-2 bg-gray-950 rounded-lg shadow-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isSubmitting || !email.trim() || !password || (isSignUp && !name.trim())}
							onClick={handleSubmit}
							type="button"
							data-loading={isSubmitting}
						>
							{isSubmitting ? 'Submitting' : isSignUp ? 'Create Account' : 'Sign In'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function TasksScreen({ user, authClient }: { user: AuthenticatedUser; authClient: AuthClient }) {
	const {
		data,
		refetch,
		isLoading: isLoadingTasks,
		error: tasksError,
	} = useAPI({ method: 'GET', path: '/api/tasks' });
	const { invoke: createTask, isLoading: isCreating } = useAPI('POST /api/tasks' as any);
	const { invoke: toggleTask } = useAPI('PATCH /api/tasks/:id' as any);
	const { invoke: deleteTask } = useAPI('DELETE /api/tasks/:id' as any);

	const [title, setTitle] = useState('');
	const [actionError, setActionError] = useState<string | null>(null);
	const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
	const [isSigningOut, setIsSigningOut] = useState(false);

	const tasks = useMemo(() => (data as { tasks?: Task[] } | undefined)?.tasks ?? [], [data]);

	const handleAddTask = useCallback(async () => {
		const trimmedTitle = title.trim();

		if (!trimmedTitle) {
			return;
		}

		setActionError(null);

		try {
			await createTask({ title: trimmedTitle });
			setTitle('');
			await refetch();
		} catch (error) {
			setActionError(error instanceof Error ? error.message : 'Unable to create task.');
		}
	}, [createTask, refetch, title]);

	const handleToggleTask = useCallback(
		async (item: Task) => {
			setActionError(null);
			setBusyTaskId(item.id);

			try {
				await toggleTask(
					{ completed: !item.completed },
					{
						params: { id: item.id },
					}
				);
				await refetch();
			} catch (error) {
				setActionError(error instanceof Error ? error.message : 'Unable to update task.');
			} finally {
				setBusyTaskId(null);
			}
		},
		[refetch, toggleTask]
	);

	const handleDeleteTask = useCallback(
		async (id: string) => {
			setActionError(null);
			setBusyTaskId(id);

			try {
				await deleteTask(undefined, {
					params: { id },
				});
				await refetch();
			} catch (error) {
				setActionError(error instanceof Error ? error.message : 'Unable to delete task.');
			} finally {
				setBusyTaskId(null);
			}
		},
		[deleteTask, refetch]
	);

	const handleSignOut = useCallback(async () => {
		setActionError(null);
		setIsSigningOut(true);

		try {
			await authClient.signOut();
		} catch (error) {
			setActionError(error instanceof Error ? error.message : 'Unable to sign out.');
		} finally {
			setIsSigningOut(false);
		}
	}, [authClient]);

	return (
		<div className="text-white flex font-sans justify-center min-h-screen">
			<div className="flex flex-col gap-6 max-w-3xl p-16 w-full">
				<div className="items-center flex flex-col gap-2 justify-center mb-2 relative text-center">
					<AppLogo />
					<h1 className="text-5xl font-thin">Your Tasks</h1>
					<p className="text-gray-400 text-lg">
						Signed in as <span className="text-white">{user.name ?? user.email}</span>
					</p>
				</div>

				<div className="bg-black border border-gray-900 rounded-lg p-6 flex flex-col gap-4">
					<div className="items-center flex justify-between gap-3 flex-wrap">
						<div className="text-sm text-gray-400">{user.email}</div>
						<button
							className="bg-transparent border border-gray-800 rounded text-gray-300 cursor-pointer text-sm transition-all duration-200 py-1.5 px-3 hover:bg-gray-900 hover:border-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isSigningOut}
							onClick={handleSignOut}
							type="button"
							data-loading={isSigningOut}
						>
							{isSigningOut ? 'Signing out' : 'Sign Out'}
						</button>
					</div>

					<div className="items-center flex gap-2">
						<input
							className="bg-gray-950 border border-gray-800 rounded-md text-white py-2.5 px-3 focus:outline-cyan-500 focus:outline-2 focus:outline-offset-2 flex-1"
							disabled={isCreating}
							onChange={(e) => setTitle(e.currentTarget.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									void handleAddTask();
								}
							}}
							placeholder="Add a new task..."
							type="text"
							value={title}
						/>
						<button
							className="font-semibold text-black bg-cyan-500 rounded-md py-2.5 px-4 cursor-pointer hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isCreating || !title.trim()}
							onClick={handleAddTask}
							type="button"
							data-loading={isCreating}
						>
							{isCreating ? 'Adding' : 'Add'}
						</button>
					</div>

					{(actionError || tasksError) && (
						<div className="bg-red-950/40 border border-red-900 text-red-300 text-sm rounded-md py-2.5 px-3">
							{actionError ?? (tasksError as Error).message}
						</div>
					)}

					<div className="bg-gray-950 border border-gray-900 rounded-md overflow-hidden">
						{isLoadingTasks ? (
							<div className="text-gray-500 text-sm py-3 px-4" data-loading="true">
								Loading tasks
							</div>
						) : tasks.length === 0 ? (
							<div className="text-gray-500 text-sm py-3 px-4">
								No tasks yet. Add your first task above.
							</div>
						) : (
							<ul className="flex flex-col">
								{tasks.map((item) => {
									const isBusy = busyTaskId === item.id;

									return (
										<li
											key={item.id}
											className="items-center flex gap-3 py-2.5 px-4 border-b border-gray-900 last:border-b-0"
										>
											<input
												checked={item.completed}
												className="size-4 cursor-pointer accent-cyan-500"
												disabled={isBusy}
												onChange={() => {
													void handleToggleTask(item);
												}}
												type="checkbox"
											/>
											<span
												className={`text-sm flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-100'}`}
											>
												{item.title}
											</span>
											<button
												className="bg-transparent border border-gray-800 rounded text-gray-300 cursor-pointer text-xs transition-all duration-200 py-1 px-2 hover:bg-gray-900 hover:border-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
												disabled={isBusy}
												onClick={() => {
													void handleDeleteTask(item.id);
												}}
												type="button"
											>
												Delete
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
