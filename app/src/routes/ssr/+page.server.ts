import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('http://localhost:3000/data');
	const payload = await res.json();

	return {
		payload
	};
};
