import { fail, redirect } from '@sveltejs/kit';
import { syncAnimalLastFed } from '$lib/server/feedings.js';

async function getFeedings(pb, animal) {
	const record = await pb.collection('feedings').getFullList({
		filter: `animal="${animal}"`,
		sort: '-fed'
	});

	return record;
}

async function getAnimal(pb, animal, owner) {
	const record = await pb.collection('animals').getFirstListItem(`id="${animal}" && owner="${owner}"`, {
		expand: 'habitat'
	});

	return {
		id: record.id,
		name: record.name,
		description: record.description,
		quantity: record.quantity || 1,
		habitatName: record.expand?.habitat?.name ?? ''
	};
}

export async function load({ params, locals }) {
	const owner = locals.pb.authStore.model.id;
	const animal = await getAnimal(locals.pb, params.animal, owner);
	return {
		feedings: getFeedings(locals.pb, params.animal),
		...animal
	};
}

export const actions = {
	removeFeeding: async ({ locals, params, request }) => {
		const owner = locals.pb.authStore.model.id;
		const animal = await getAnimal(locals.pb, params.animal, owner);
		const formData = await request.formData();
		const feedingId = String(formData.get('id') ?? '');
		if (!/^[a-z0-9]{15}$/.test(feedingId)) {
			return fail(400, { error: 'Feeding not found.' });
		}

		let feeding;
		try {
			feeding = await locals.pb
				.collection('feedings')
				.getFirstListItem(`id="${feedingId}" && animal="${params.animal}"`);
		} catch (error) {
			if (error?.status === 404) return fail(404, { error: 'Feeding not found.' });
			throw error;
		}

		let latestFeeding;
		try {
			latestFeeding = await locals.pb
				.collection('feedings')
				.getFirstListItem(`animal="${animal.id}"`, { sort: '-fed' });
		} catch (error) {
			if (error?.status !== 404) throw error;
		}

		await locals.pb.collection('feedings').delete(feeding.id);
		if (latestFeeding?.id === feeding.id) {
			await syncAnimalLastFed(locals.pb, animal.id);
		}

		throw redirect(303, `/animals/${animal.id}`);
	},
	deleteAnimal: async ({ locals, params }) => {
		const owner = locals.pb.authStore.model.id;
		await getAnimal(locals.pb, params.animal, owner);
		await locals.pb.collection('animals').delete(params.animal);
		throw redirect(303, '/animals');
	}
};
