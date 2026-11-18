routerAdd(
	'POST',
	'/api/animal-log/vacation-share/create',
	(event) => {
		const body = event.requestInfo().body || {};
		const groupIds = Array.isArray(body.groupIds) ? [...new Set(body.groupIds)] : [];
		const permission = String(body.permission || '');
		if (!groupIds.length || groupIds.length > 100 || groupIds.some((id) => !/^[a-z0-9]{15}$/.test(id))) {
			return event.json(400, { error: 'Choose valid animal groups.' });
		}
		if (!['feeding_and_tasks', 'feeding_only', 'view_only'].includes(permission)) {
			return event.json(400, { error: 'Choose a valid link permission.' });
		}

		const ownerId = event.auth.id;
		const groups = event.app
			.findRecordsByIds('animals', groupIds)
			.filter((animal) => animal.getString('owner') === ownerId);
		if (groups.length !== groupIds.length) {
			return event.json(400, { error: 'Choose only animal groups in your account.' });
		}

		const token = $security.randomString(48);
		const share = new Record(event.app.findCollectionByNameOrId('careShares'));
		share.set('tokenHash', $security.sha256(token));
		share.set('owner', ownerId);
		share.set('sharedAnimals', groupIds);
		share.set('expiresAt', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
		share.set('permission', permission);
		share.set('revoked', false);
		event.app.save(share);

		return event.json(200, { token: token });
	},
	$apis.requireAuth()
);

routerAdd('GET', '/api/animal-log/vacation-share', (event) => {
	const token = event.request.header.get('X-Care-Share-Token') || '';
	if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
		return event.json(404, { error: 'Care link not found.' });
	}

	const matches = event.app.findRecordsByFilter(
		'careShares',
		'tokenHash = {:hash}',
		'',
		1,
		0,
		{ hash: $security.sha256(token) }
	);
	if (!matches.length) return event.json(404, { error: 'Care link not found.' });

	const share = matches[0];
	if (share.getBool('revoked') || Date.parse(share.getString('expiresAt')) <= Date.now()) {
		return event.json(410, { error: 'This care link has expired or was revoked.' });
	}

	const ownerId = share.getString('owner');
	const groups = event.app
		.findRecordsByIds('animals', share.getStringSlice('sharedAnimals'))
		.filter((animal) => animal.getString('owner') === ownerId);
	const permission = share.getString('permission');
	const publicGroups = groups.map((animal) => {
		const id = animal.id;
		const habitatId = animal.getString('habitat');
		const habitats = habitatId
			? event.app.findRecordsByFilter(
					'habitats',
					'id = {:id} && owner = {:owner}',
					'',
					1,
					0,
					{ id: habitatId, owner: ownerId }
				)
			: [];
		const feedings = event.app.findRecordsByFilter(
			'feedings',
			'animal = {:animal}',
			'-fed',
			5,
			0,
			{ animal: id }
		);
		const tasks = event.app.findRecordsByFilter(
			'tasks',
			'animal = {:animal} && owner = {:owner}',
			'completed,dueDate,title',
			50,
			0,
			{ animal: id, owner: ownerId }
		);

		return {
			id: id,
			name: animal.getString('name'),
			description: animal.getString('description'),
			quantity: animal.getInt('quantity') || 1,
			dates: animal.getStringSlice('dates'),
			habitatName: habitats.length ? habitats[0].getString('name') : '',
			feedings: feedings.map((feeding) => ({
				food: feeding.getString('food'),
				fed: feeding.getString('fed'),
				fedBy: feeding.getString('fedBy')
			})),
			tasks: tasks.map((task) => ({
				id: task.id,
				title: task.getString('title'),
				notes: task.getString('notes'),
				dueDate: task.getString('dueDate'),
				completed: task.getBool('completed'),
				completedBy: task.getString('completedBy'),
				completedAt: task.getString('completedAt')
			})),
			canLogFeedings: permission !== 'view_only',
			canCompleteTasks: permission === 'feeding_and_tasks'
		};
	});

	return event.json(200, {
		permission: permission,
		expiresAt: share.getString('expiresAt'),
		groups: publicGroups
	});
});

routerAdd('POST', '/api/animal-log/vacation-share', (event) => {
	const token = event.request.header.get('X-Care-Share-Token') || '';
	if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
		return event.json(404, { error: 'Care link not found.' });
	}

	const matches = event.app.findRecordsByFilter(
		'careShares',
		'tokenHash = {:hash}',
		'',
		1,
		0,
		{ hash: $security.sha256(token) }
	);
	if (!matches.length) return event.json(404, { error: 'Care link not found.' });

	const share = matches[0];
	if (share.getBool('revoked') || Date.parse(share.getString('expiresAt')) <= Date.now()) {
		return event.json(410, { error: 'This care link has expired or was revoked.' });
	}

	const body = event.requestInfo().body || {};
	const visitorName = String(body.visitorName || '').trim().slice(0, 100);
	if (!visitorName) return event.json(400, { error: 'Enter your name before logging care.' });

	const ownerId = share.getString('owner');
	const groups = event.app
		.findRecordsByIds('animals', share.getStringSlice('sharedAnimals'))
		.filter((animal) => animal.getString('owner') === ownerId);
	const group = groups.find((animal) => animal.id === body.animalId);
	if (!group) return event.json(404, { error: 'That animal group is not included in this link.' });

	const permission = share.getString('permission');
	if (body.action === 'feed') {
		if (permission === 'view_only') return event.json(403, { error: 'This link is view-only.' });
		const food = String(body.food || '').trim();
		if (!food || food.length > 200) {
			return event.json(400, { error: 'Enter what you fed (up to 200 characters).' });
		}

		const now = new Date().toISOString();
		event.app.runInTransaction((txApp) => {
			const feeding = new Record(txApp.findCollectionByNameOrId('feedings'));
			feeding.set('animal', group.id);
			feeding.set('food', food);
			feeding.set('fed', now);
			feeding.set('fedBy', visitorName);
			txApp.save(feeding);

			const animal = txApp.findRecordById('animals', group.id);
			const latestFeedings = txApp.findRecordsByFilter(
				'feedings',
				'animal = {:animal}',
				'-fed',
				1,
				0,
				{ animal: group.id }
			);
			animal.set('lastFed', latestFeedings.length ? latestFeedings[0].getString('fed') : '');
			txApp.save(animal);
		});

		return event.json(200, { success: true });
	}

	if (body.action === 'completeTask') {
		if (permission !== 'feeding_and_tasks') {
			return event.json(403, { error: 'This link does not allow completing tasks.' });
		}
		if (typeof body.taskId !== 'string' || !/^[a-z0-9]{15}$/.test(body.taskId)) {
			return event.json(400, { error: 'Choose a valid care task.' });
		}

		const tasks = event.app.findRecordsByFilter(
			'tasks',
			'id = {:id} && animal = {:animal} && owner = {:owner}',
			'',
			1,
			0,
			{ id: body.taskId, animal: group.id, owner: ownerId }
		);
		if (!tasks.length) return event.json(404, { error: 'Care task not found.' });

		const task = tasks[0];
		if (!task.getBool('completed')) {
			task.set('completed', true);
			task.set('completedBy', visitorName);
			task.set('completedAt', new Date().toISOString());
			event.app.save(task);
		}

		return event.json(200, { success: true });
	}

	return event.json(400, { error: 'Unsupported care action.' });
});
