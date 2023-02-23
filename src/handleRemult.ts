// probably this all file should be a 'remult/server-sveltekit' or something like this (accepting all createRemultServer options);

import type { Handle } from '@sveltejs/kit';
import { createRemultServer } from 'remult/server';
import { Task } from './shared/Task';

export const remultServer = createRemultServer({
	entities: [Task]
});

export const handleRemult = (async ({ event, resolve }) => {
	// get '/api' path from "remultServer"
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
