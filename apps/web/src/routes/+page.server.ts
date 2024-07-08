import { SECRET_ENV_VAR } from '$env/static/private';

export function load() {
	return {
		SECRET_ENV_VAR: `Loaded on the server from $env/static/private: ${SECRET_ENV_VAR}`
	};
}
