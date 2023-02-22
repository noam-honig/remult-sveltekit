import type { Handle } from '@sveltejs/kit';
import { createRemultServer } from 'remult/server';
import { Task } from './shared/Task';

const remultServer = createRemultServer({
	entities: [Task]
});

export const handle = (async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api')) {
		const remultHandler = await remultServer.handle(event.request);

		if (remultHandler) {
			return new Response(JSON.stringify(remultHandler.data), { status: remultHandler.statusCode });
		}

		return new Response('remult error', { status: 501 });
	}

	const response = await resolve(event);
	return response;
}) satisfies Handle;
