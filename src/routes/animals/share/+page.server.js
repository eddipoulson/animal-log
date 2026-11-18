import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const owner = locals.pb.authStore.model.id;
	const [animals, shares] = await Promise.all([
		locals.pb.collection('animals').getFullList({
			filter: `owner="${owner}"`,
			sort: 'name',
			expand: 'habitat'
		}),
		locals.pb.collection('careShares').getFullList({
			filter: `owner="${owner}"`,
			sort: '-created',
			fields: 'id,expiresAt,revoked,permission,sharedAnimals,created'
		})
	]);

	const animalNames = new Map(animals.map((animal) => [animal.id, animal.name]));
	const now = Date.now();
	return {
		animals: animals.map((animal) => ({
			id: animal.id,
			name: animal.name,
			description: animal.description,
			habitatName: animal.expand?.habitat?.name ?? ''
		})),
		shares: shares.map((share) => ({
			id: share.id,
			expiresAt: share.expiresAt,
			revoked: share.revoked,
			expired: Date.parse(share.expiresAt) <= now,
			permission: share.permission,
			groups: (share.sharedAnimals ?? []).map((id) => animalNames.get(id) ?? 'Removed group')
		}))
	};
}

export const actions = {
	create: async ({ locals, request, url }) => {
		const owner = locals.pb.authStore.model.id;
		const formData = await request.formData();
		const groupIds = [...new Set(formData.getAll('animals').map(String))];
		const permission = String(formData.get('permission') ?? '');
		if (!groupIds.length) return fail(400, { error: 'Select at least one animal group.' });
		if (groupIds.length > 100 || groupIds.some((id) => !/^[a-z0-9]{15}$/.test(id))) {
			return fail(400, { error: 'Choose valid animal groups.' });
		}
		if (!['feeding_and_tasks', 'feeding_only', 'view_only'].includes(permission)) {
			return fail(400, { error: 'Choose a valid link permission.' });
		}

		const ownedGroups = await locals.pb.collection('animals').getFullList({
			filter: `owner="${owner}"`,
			fields: 'id'
		});
		const ownedIds = new Set(ownedGroups.map((group) => group.id));
		if (groupIds.some((id) => !ownedIds.has(id))) {
			return fail(400, { error: 'Choose only animal groups in your account.' });
		}

		const { token } = await locals.pb.send('/api/animal-log/vacation-share/create', {
			method: 'POST',
			body: { groupIds, permission }
		});

		return {
			shareUrl: new URL(`/share/${token}`, url.origin).toString(),
			success: true
		};
	},
	revoke: async ({ locals, request }) => {
		const owner = locals.pb.authStore.model.id;
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '');
		if (!/^[a-z0-9]{15}$/.test(id)) return fail(400, { error: 'Share link not found.' });

		const share = await locals.pb
			.collection('careShares')
			.getFirstListItem(`id="${id}" && owner="${owner}"`);
		await locals.pb.collection('careShares').update(share.id, { revoked: true });
		throw redirect(303, '/animals/share');
	}
};
