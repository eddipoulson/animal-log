import { fail, redirect } from '@sveltejs/kit';
import { syncAnimalLastFed } from '$lib/server/feedings.js';

export async function load({ locals }) {
	const owner = locals.pb.authStore.model.id;
	const [animals, feedings, habitats] = await Promise.all([
		locals.pb.collection('animals').getFullList({
			filter: `owner="${owner}"`,
			sort: 'name',
			fields: 'id,name,description,quantity,dates,lastFed,habitat'
		}),
		locals.pb.collection('feedings').getFullList({
			sort: '-fed',
			fields: 'animal,food,fed'
		}),
		locals.pb.collection('habitats').getFullList({
			filter: `owner="${owner}"`,
			fields: 'id,name'
		})
	]);

	const habitatNames = new Map(habitats.map(({ id, name }) => [id, name]));
	const lastFeedings = {};
	for (const feeding of feedings) {
		if (!lastFeedings[feeding.animal]) {
			lastFeedings[feeding.animal] = { food: feeding.food, fed: feeding.fed };
		}
	}

	for (const animal of animals) {
		if (!lastFeedings[animal.id] && animal.lastFed) {
			lastFeedings[animal.id] = { food: '', fed: animal.lastFed };
		}
	}

	return {
		animals: animals.map((animal) => ({
			id: animal.id,
			name: animal.name,
			description: animal.description,
			quantity: animal.quantity || 1,
			dates: animal.dates ?? [],
			habitatId: animal.habitat ?? '',
			habitatName: habitatNames.get(animal.habitat) ?? ''
		})),
		lastFeedings
	};
}

export const actions = {
	repeatLast: async ({ locals, request }) => {
		const owner = locals.pb.authStore.model.id;
		const formData = await request.formData();
		const animalId = String(formData.get('animal') ?? '');
		if (!/^[a-z0-9]{15}$/.test(animalId)) {
			return fail(400, { error: 'Choose a valid animal.' });
		}

		let animal;
		try {
			animal = await locals.pb
				.collection('animals')
				.getFirstListItem(`id="${animalId}" && owner="${owner}"`);
		} catch (error) {
			if (error?.status === 404) return fail(404, { error: 'Animal not found.' });
			throw error;
		}

		let previousFeeding;
		try {
			previousFeeding = await locals.pb
				.collection('feedings')
				.getFirstListItem(`animal="${animal.id}"`, { sort: '-fed' });
		} catch (error) {
			if (error?.status === 404) {
				return fail(400, { error: 'Log a feeding before repeating one.' });
			}
			throw error;
		}

		const fed = new Date().toISOString();
		await locals.pb.collection('feedings').create({
			food: previousFeeding.food,
			animal: animal.id,
			fed
		});
		await syncAnimalLastFed(locals.pb, animal.id);

		throw redirect(303, '/animals');
	}
};
