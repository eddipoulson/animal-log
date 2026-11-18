import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const owner = locals.pb.authStore.model.id;
	const [habitats, animals] = await Promise.all([
		locals.pb.collection('habitats').getFullList({
			filter: `owner="${owner}"`,
			sort: 'name'
		}),
		locals.pb.collection('animals').getFullList({
			filter: `owner="${owner}"`,
			fields: 'id,name,habitat'
		})
	]);

	const counts = animals.reduce((result, animal) => {
		if (animal.habitat) result[animal.habitat] = (result[animal.habitat] ?? 0) + 1;
		return result;
	}, {});

	return {
		habitats: habitats.map((habitat) => ({
			id: habitat.id,
			name: habitat.name,
			notes: habitat.notes,
			groupCount: counts[habitat.id] ?? 0
		}))
	};
}

export const actions = {
	add: async ({ locals, request }) => {
		const owner = locals.pb.authStore.model.id;
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		if (!name || name.length > 100) {
			return fail(400, { error: 'Enter a tank name of 1–100 characters.' });
		}

		await locals.pb.collection('habitats').create({
			name,
			owner,
			notes: String(formData.get('notes') ?? '').trim()
		});
		throw redirect(303, '/animals/tanks');
	},
	rename: async ({ locals, request }) => {
		const owner = locals.pb.authStore.model.id;
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '');
		const name = String(formData.get('name') ?? '').trim();
		if (!id || !name || name.length > 100) {
			return fail(400, { error: 'Enter a valid tank name.' });
		}

		const habitat = await locals.pb
			.collection('habitats')
			.getFirstListItem(`id="${id}" && owner="${owner}"`);
		await locals.pb.collection('habitats').update(habitat.id, { name });
		throw redirect(303, '/animals/tanks');
	},
	remove: async ({ locals, request }) => {
		const owner = locals.pb.authStore.model.id;
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '');
		if (!id) return fail(400, { error: 'Tank not found.' });

		const habitat = await locals.pb
			.collection('habitats')
			.getFirstListItem(`id="${id}" && owner="${owner}"`);
		const groups = await locals.pb.collection('animals').getFullList({
			filter: `habitat="${habitat.id}" && owner="${owner}"`,
			fields: 'id'
		});
		for (const group of groups) {
			await locals.pb.collection('animals').update(group.id, { habitat: '' });
		}
		await locals.pb.collection('habitats').delete(habitat.id);
		throw redirect(303, '/animals/tanks');
	}
};
