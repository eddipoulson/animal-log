import { fail, redirect } from '@sveltejs/kit';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function load({ locals, params }) {
	const owner = locals.pb.authStore.model.id;
	const [animal, habitats] = await Promise.all([
		locals.pb.collection('animals').getFirstListItem(`id="${params.animal}" && owner="${owner}"`),
		locals.pb.collection('habitats').getFullList({
			filter: `owner="${owner}"`,
			sort: 'name',
			fields: 'id,name'
		})
	]);

	return {
		animal: {
			id: animal.id,
			name: animal.name,
			description: animal.description,
			dates: animal.dates ?? [],
			quantity: animal.quantity || 1,
			habitat: animal.habitat ?? ''
		},
		habitats: habitats.map(({ id, name }) => ({ id, name }))
	};
}

export const actions = {
	edit: async ({ locals, request, params }) => {
		const formData = await request.formData();
		const id = locals.pb.authStore.model.id;
		const animal = await locals.pb
			.collection('animals')
			.getFirstListItem(`id="${params.animal}" && owner="${id}"`);
		const description = String(formData.get('description') ?? '').trim();
		const habitat = String(formData.get('habitat') ?? '');
		const quantity = Number(formData.get('quantity') || 1);
		const dates = daysOfWeek.filter((day) => formData.getAll(day).includes(day));

		if (!description || !Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
			return fail(400, { error: 'Enter a type and whole-number quantity between 1 and 10,000.' });
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

		await locals.pb.collection('animals').update(animal.id, {
			description,
			dates,
			habitat,
			quantity
		});

		throw redirect(303, '/animals');
	}
};
