import { PRIVATE_STATIC } from '$env/static/private';
import { env } from '$env/dynamic/private';

export function load() {
	return {
		PRIVATE_STATIC: `Loaded on the server from $env/static/private: ${PRIVATE_STATIC}`,
    PRIVATE_DYNAMIC: `Loaded on the server from $env/dynamic/private: ${env.PRIVATE_DYNAMIC}`
	};
}
