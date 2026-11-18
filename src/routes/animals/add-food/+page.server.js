import { fail, redirect } from '@sveltejs/kit';
import { syncAnimalLastFed } from '$lib/server/feedings.js';

async function getAnimals(pb, user) {
	const animals = await pb.collection('animals').getFullList({
		filter: `owner="${user}"`,
		fields: 'id, name'
	});

	return animals;
}

export const actions = {
	add: async ({ locals, request }) => {
		const formData = await request.formData();
		const food = String(formData.get('food') ?? '').trim();
		const animalId = String(formData.get('animal') ?? '');
		const fedInput = String(formData.get('fed') ?? '');
		const date = fedInput ? new Date(fedInput) : new Date();
		if (!food) return fail(400, { error: 'Enter what you fed.' });
		if (!/^[a-z0-9]{15}$/.test(animalId)) {
			return fail(400, { error: 'Choose a valid animal.' });
		}
		if (
			Number.isNaN(date.getTime()) ||
			(fedInput && date.toISOString() !== fedInput)
		) {
			return fail(400, { error: 'Choose a valid feeding date and time.' });
		}

		const feed_data = {
			food,
			animal: animalId,
			fed: date.toISOString()
		};

		await locals.pb.collection('feedings').create(feed_data);
		await syncAnimalLastFed(locals.pb, animalId);

		throw redirect(303, '/animals');
	}
};

export async function load({ locals, url }) {
	const user = locals.pb.authStore.model.id;
	const animal = url.searchParams?.get('animal');
	const date = url.searchParams?.get('date') || new Date(); // feeds are either today or from scheduled feeds

	return {
		record: await getAnimals(locals.pb, user),
		animal,
		date
	};
}
