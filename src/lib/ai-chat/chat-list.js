/**
 * Pure helpers for the sidebar's chat list (no Svelte, easy to test).
 */

/** @typedef {{ id: string, title: string, time: number | null }} ChatRow */

function toTime(value) {
	if (value === null || value === undefined || value === '') return null;
	if (typeof value === 'number') return value < 1e12 ? value * 1000 : value; // seconds or ms
	const t = Date.parse(value);
	return Number.isNaN(t) ? null : t;
}

/**
 * Turn the raw JSON from GET /api/chat/chats/ into uniform rows.
 *
 * Accepts a bare array or { results | chats | data: [] }. Per chat it looks for:
 *   id    -> id | chat_id | uuid | pk
 *   title -> title | name            (falls back to "New chat")
 *   date  -> updated_at | updatedAt | last_message_at | modified_at | created_at | createdAt
 * Rename the keys here if your API uses different ones.
 *
 * @param {any} raw
 * @returns {ChatRow[]}
 */
export function normalizeChats(raw) {
	const list = Array.isArray(raw) ? raw : (raw?.results ?? raw?.chats ?? raw?.data ?? []);
	if (!Array.isArray(list)) return [];

	/** @type {ChatRow[]} */
	const rows = [];
	for (const c of list) {
		const id = c?.id ?? c?.chat_id ?? c?.uuid ?? c?.pk;
		if (id === undefined || id === null || id === '') continue;

		const stamp =
			c.updated_at ?? c.updatedAt ?? c.last_message_at ?? c.modified_at ?? c.created_at ?? c.createdAt;

		rows.push({
			id: String(id),
			title: String(c.title ?? c.name ?? '').trim() || 'New chat',
			time: toTime(stamp)
		});
	}
	return rows;
}

/** @param {ChatRow[]} chats @param {string} query */
export function filterChats(chats, query) {
	const q = query.trim().toLowerCase();
	return q ? chats.filter((c) => c.title.toLowerCase().includes(q)) : chats;
}

/**
 * Newest first, bucketed like Claude / ChatGPT: Today, Yesterday, Previous 7 days...
 * Chats without a date go in a final "Chats" group, in the order the API sent them.
 *
 * @param {ChatRow[]} chats
 * @param {Date} [now]
 * @returns {{ label: string, items: ChatRow[] }[]}
 */
export function groupChats(chats, now = new Date()) {
	const startOfDay = (t) => {
		const d = new Date(t);
		return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	};
	// Calendar arithmetic (not "minus 24h") so daylight-saving changes don't shift a bucket.
	const daysAgo = (n) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n).getTime();

	const buckets = [
		{ label: 'Today', min: daysAgo(0) },
		{ label: 'Yesterday', min: daysAgo(1) },
		{ label: 'Previous 7 days', min: daysAgo(7) },
		{ label: 'Previous 30 days', min: daysAgo(30) },
		{ label: 'Older', min: -Infinity }
	].map((b) => ({ ...b, items: /** @type {ChatRow[]} */ ([]) }));

	const undated = [];
	const sorted = [...chats].sort((a, b) => (b.time ?? 0) - (a.time ?? 0));

	for (const chat of sorted) {
		if (chat.time === null) {
			undated.push(chat);
			continue;
		}
		const day = startOfDay(chat.time);
		buckets.find((b) => day >= b.min)?.items.push(chat);
	}

	const groups = buckets.filter((b) => b.items.length).map(({ label, items }) => ({ label, items }));
	if (undated.length) groups.push({ label: 'Chats', items: undated });
	return groups;
}

/** "ada.lovelace" -> "AL", "Sam" -> "S" */
export function initialsOf(name) {
	return (
		String(name ?? '')
			.split(/[\s._-]+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0])
			.join('')
			.toUpperCase() || '?'
	);
}
