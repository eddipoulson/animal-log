import { fail, redirect } from '@sveltejs/kit';

async function getOwnedTask(pb, taskId, userId) {
	return pb.collection('tasks').getFirstListItem(`id="${taskId}" && owner="${userId}"`);
}

export async function load({ locals }) {
	const userId = locals.pb.authStore.model.id;
	const [tasks, animals] = await Promise.all([
		locals.pb.collection('tasks').getFullList({
			filter: `owner="${userId}"`,
			sort: 'completed,dueDate,title',
			expand: 'animal,animal.habitat'
		}),
		locals.pb.collection('animals').getFullList({
			filter: `owner="${userId}"`,
			sort: 'name',
			fields: 'id,name,habitat,quantity',
			expand: 'habitat'
		})
	]);

	return {
		tasks: tasks.map((task) => ({
			id: task.id,
			title: task.title,
			notes: task.notes,
			animal: task.animal,
			animalName: task.expand?.animal?.name ?? '',
			habitatName: task.expand?.animal?.expand?.habitat?.name ?? '',
			dueDate: task.dueDate,
			completed: task.completed,
			completedBy: task.completedBy,
			completedAt: task.completedAt
		})),
		animals: animals.map((animal) => ({
			id: animal.id,
			name: animal.name,
			habitatName: animal.expand?.habitat?.name ?? ''
		}))
	};
}

export const actions = {
	add: async ({ locals, request }) => {
		const userId = locals.pb.authStore.model.id;
		const formData = await request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const notes = String(formData.get('notes') ?? '').trim();
		const animalId = String(formData.get('animal') ?? '');
		const dueDateInput = String(formData.get('dueDate') ?? '');

		if (!title) return fail(400, { error: 'Add a title for this task.' });
		if (title.length > 200) return fail(400, { error: 'Task titles must be 200 characters or fewer.' });

		if (animalId) {
			try {
				await locals.pb
					.collection('animals')
					.getFirstListItem(`id="${animalId}" && owner="${userId}"`);
			} catch (error) {
				if (error?.status === 404) return fail(400, { error: 'Choose one of your animals.' });
				throw error;
			}
		}

		let dueDate = '';
		if (dueDateInput) {
			if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDateInput)) {
				return fail(400, { error: 'Choose a valid due date.' });
			}
			const parsedDate = new Date(`${dueDateInput}T00:00:00.000Z`);
			if (
				Number.isNaN(parsedDate.getTime()) ||
				parsedDate.toISOString().slice(0, 10) !== dueDateInput
			) {
				return fail(400, { error: 'Choose a valid due date.' });
			}
			dueDate = parsedDate.toISOString();
		}

		await locals.pb.collection('tasks').create({
			title,
			notes,
			owner: userId,
			animal: animalId || null,
			dueDate,
			completed: false
		});

		throw redirect(303, '/animals/tasks');
	},
	toggle: async ({ locals, request }) => {
		const userId = locals.pb.authStore.model.id;
		const formData = await request.formData();
		const taskId = String(formData.get('id') ?? '');
		if (!taskId) return fail(400, { error: 'Task not found.' });

		const task = await getOwnedTask(locals.pb, taskId, userId);
		const completed = !task.completed;
		await locals.pb.collection('tasks').update(task.id, {
			completed,
			completedBy: completed ? locals.pb.authStore.model.name || 'Owner' : '',
			completedAt: completed ? new Date().toISOString() : ''
		});

		throw redirect(303, '/animals/tasks');
	},
	remove: async ({ locals, request }) => {
		const userId = locals.pb.authStore.model.id;
		const formData = await request.formData();
		const taskId = String(formData.get('id') ?? '');
		if (!taskId) return fail(400, { error: 'Task not found.' });

		const task = await getOwnedTask(locals.pb, taskId, userId);
		await locals.pb.collection('tasks').delete(task.id);

		throw redirect(303, '/animals/tasks');
	}
};
