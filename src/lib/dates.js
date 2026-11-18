export function toDateTimeLocal(value = new Date()) {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return '';

	const pad = (n) => String(n).padStart(2, '0');

	return (
		d.getFullYear() +
		'-' +
		pad(d.getMonth() + 1) +
		'-' +
		pad(d.getDate()) +
		'T' +
		pad(d.getHours()) +
		':' +
		pad(d.getMinutes())
	);
}

export function fromDateTimeLocal(value) {
	if (!value) return '';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export function formatDateTime(value) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';

	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}).format(date);
}

export function formatDateOnly(value) {
	if (!value) return '';
	const dateText =
		value instanceof Date
			? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
			: String(value).slice(0, 10);
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
	if (!match) return '';

	const [, year, month, day] = match;
	const date = new Date(Number(year), Number(month) - 1, Number(day), 12);
	if (
		date.getFullYear() !== Number(year) ||
		date.getMonth() !== Number(month) - 1 ||
		date.getDate() !== Number(day)
	) {
		return '';
	}

	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(date);
}

export function localDateKey(value = new Date()) {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export const DAYS_OF_WEEK = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];

export function getDayOfWeek(date) {
	return DAYS_OF_WEEK[new Date(date).getDay()];
}

export function timeSince(date) {
	const now = new Date();
	const time = date instanceof Date ? date.getTime() : new Date(date).getTime();
	if (Number.isNaN(time)) return '';
	const diffMs = now.getTime() - time;

	const seconds = Math.floor(diffMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	if (minutes > 0) return `${minutes}m ago`;
	return 'just now';
}
