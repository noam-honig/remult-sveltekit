// probably this all file should be a 'remult/server-sveltekit' or something like this (accepting all createRemultServer options);

import type { Handle } from '@sveltejs/kit';
import { createRemultServer, type GenericResponse } from 'remult/server';
import { Task } from './shared/Task';

export const remultServer = createRemultServer({
	entities: [Task]
});

export const handleRemult = (async ({ event, resolve }) => {
	// get '/api' path from "remultServer"
	if (event.url.pathname.startsWith('/api')) {
		let json = {};
		try {
			if (event.request.method == 'POST' || event.request.method == 'PUT') {
				json = await event.request.json();
			}
		} catch (error) {
			console.log(error);
		}
		let sseResponse: Response | undefined = undefined;
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		let onClose = () => {};
		const response: GenericResponse & {
			write(data: string): void;
			writeHead(status: number, headers: any): void;
			flush?(): void;
		} = {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			end: () => {},
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			json: () => {},
			status: () => {
				return response;
			},
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			write: () => {},
			writeHead: (status, headers) => {
				if (status === 200 && headers) {
					const contentType = headers['Content-Type'];
					if (contentType === 'text/event-stream') {
						const messages: string[] = [];
						response.write = (x) => messages.push(x);
						const stream = new ReadableStream({
							start: (controller) => {
								for (const message of messages) {
									controller.enqueue(message);
								}
								response.write = (data) => {
									controller.enqueue(data);
								};
							},
							cancel: () => {
								// eslint-disable-next-line @typescript-eslint/no-empty-function
								response.write = () => {};
								onClose();
							}
						});
						sseResponse = new Response(stream, { headers });
					}
				}
			}
		};

		const responseFromRemultHandler = await remultServer.handle(
			{
				url: event.request.url,
				method: event.request.method,
				body: json,

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				on: (event: 'close', do1: VoidFunction) => {
					if (event === 'close') {
						onClose = do1;
					}
				}
			},
			response
		);
		if (sseResponse !== undefined) {
			return sseResponse;
		}
		if (responseFromRemultHandler) {
			return new Response(JSON.stringify(responseFromRemultHandler.data), {
				status: responseFromRemultHandler.statusCode
			});
		}
	}

	const response = await resolve(event);
	return response;
}) satisfies Handle;
