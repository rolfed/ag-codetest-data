import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('http://localhost:3000/data');
	return {
		streamed: {
			payload: res.json()
		}
	};
};
