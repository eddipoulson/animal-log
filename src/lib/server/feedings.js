export async function syncAnimalLastFed(pb, animalId) {
	let latestFeeding;
	try {
		latestFeeding = await pb
			.collection('feedings')
			.getFirstListItem(`animal="${animalId}"`, { sort: '-fed' });
	} catch (error) {
		if (error?.status !== 404) throw error;
	}

	await pb.collection('animals').update(animalId, {
		lastFed: latestFeeding?.fed ?? ''
	});
}
