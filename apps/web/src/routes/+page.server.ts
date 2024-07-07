import { PRIVATE_STATIC } from '$env/static/private';

export function load() {
	return {
		PRIVATE_STATIC: `Loaded on the server from $env/static/private: ${PRIVATE_STATIC}`
	};
}
