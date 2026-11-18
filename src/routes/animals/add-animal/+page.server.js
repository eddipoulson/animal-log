import { fail, redirect } from '@sveltejs/kit';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function load({ locals }) {
	const owner = locals.pb.authStore.model.id;
	const habitats = await locals.pb.collection('habitats').getFullList({
		filter: `owner="${owner}"`,
		sort: 'name',
		fields: 'id,name'
	});

	return { habitats: habitats.map(({ id, name }) => ({ id, name })) };
}

export const actions = {
	add: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = locals.pb.authStore.model.id;
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		const habitat = String(formData.get('habitat') ?? '');
		const quantity = Number(formData.get('quantity') || 1);
		const dates = daysOfWeek.filter((day) => formData.getAll(day).includes(day));

		if (!name || !description || !Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
			return fail(400, { error: 'Enter a name, type, and whole-number quantity between 1 and 10,000.' });
		}
		if (habitat) {
			try {
				await locals.pb.collection('habitats').getFirstListItem(
					`id="${habitat}" && owner="${id}"`
				);
			} catch (error) {
				if (error?.status === 404) return fail(400, { error: 'Choose one of your tanks.' });
				throw error;
			}
		}

		await locals.pb.collection('animals').create({
			name,
			owner: id,
			description,
			dates,
			habitat,
			quantity
		});

		throw redirect(303, '/animals');
	}
};
