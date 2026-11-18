import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { error, fail, redirect } from '@sveltejs/kit';

const shareEndpoint = `${PUBLIC_POCKETBASE_URL.replace(/\/$/, '')}/api/animal-log/vacation-share`;

export async function load({ fetch, params, url }) {
	const response = await fetch(shareEndpoint, {
		headers: { 'X-Care-Share-Token': params.token }
	});
	const result = await response.json();

	if (response.status === 404 || response.status === 410) {
		return { available: false, message: result.error, token: params.token };
	}
	if (!response.ok) throw error(503, 'The care page is temporarily unavailable.');

	return {
		available: true,
		share: result,
		token: params.token,
		saved: url.searchParams.get('saved') === '1'
	};
}

export const actions = {
	log: async ({ fetch, params, request }) => {
		const formData = await request.formData();
		const payload = {
			action: String(formData.get('action') ?? ''),
			animalId: String(formData.get('animalId') ?? ''),
			taskId: String(formData.get('taskId') ?? ''),
			food: String(formData.get('food') ?? ''),
			visitorName: String(formData.get('visitorName') ?? '')
		};
		const response = await fetch(shareEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Care-Share-Token': params.token
			},
			body: JSON.stringify(payload)
		});
		const result = await response.json();
		if (!response.ok) return fail(response.status, { error: result.error || 'Could not save this care log.' });

		throw redirect(303, `/share/${params.token}?saved=1`);
	}
};
