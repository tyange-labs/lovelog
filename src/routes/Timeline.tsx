import { createEffect, createMemo, createResource, For, onCleanup, Show } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { getPostsCached } from '#/lib/cms';
import { claimTarget, entryElementId, holdInView, TARGET_PARAM } from '#/lib/deeplink';
import { buildTimelineRows } from '#/lib/timeline';
import type { TimelineRow } from '#/lib/timeline';
import Entry from '#/components/Entry';
import MonthHeader from '#/components/MonthHeader';
import Loading from '#/components/Loading';

function TimelineRowView(props: { row: TimelineRow; target: string | null }) {
	if (props.row.kind === 'month') {
		return <MonthHeader month={props.row.month} />;
	}

	return <Entry post={props.row.post} isTarget={props.row.post.post_id === props.target} />;
}

export default function Timeline() {
	// 캐시가 있으면 fetcher가 배열을 동기로 돌려줘 리소스가 로딩 없이 바로 준비된다.
	const [posts] = createResource(getPostsCached);
	const rows = createMemo(() => buildTimelineRows(posts() ?? []));
	const [searchParams] = useSearchParams<{ [TARGET_PARAM]: string }>();
	const target = claimTarget(searchParams[TARGET_PARAM]);

	createEffect(() => {
		if (!target || rows().length === 0) {
			return;
		}
		const element = document.getElementById(entryElementId(target));
		if (element) {
			onCleanup(holdInView(element));
		}
	});

	return (
		<>
			<Show when={posts.loading}>
				<Loading label="기록을 불러오는 중…" />
			</Show>

			<Show when={posts.error}>
				<p>{posts.error instanceof Error ? posts.error.message : '목록을 불러오지 못했어요.'}</p>
			</Show>

			<Show when={!posts.loading && !posts.error}>
				<Show when={rows().length > 0} fallback={<p>아직 기록이 없어요.</p>}>
					<For each={rows()}>{(row) => <TimelineRowView row={row} target={target} />}</For>
				</Show>
			</Show>
		</>
	);
}
