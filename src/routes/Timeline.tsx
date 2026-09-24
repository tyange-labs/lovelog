import { createMemo, createResource, For, Show } from 'solid-js';
import { getPostsCached } from '#/lib/cms';
import { buildTimelineRows } from '#/lib/timeline';
import type { TimelineRow } from '#/lib/timeline';
import Entry from '#/components/Entry';
import MonthHeader from '#/components/MonthHeader';
import LoadingHeart from '#/components/LoadingHeart';

// row.kind에 따라 분기한다. row는 buildTimelineRows가 새 배열을 만들 때마다 새 객체로
// 나오므로(참조가 바뀌면 다시 그려짐) 평범한 if/else로도 충분하다.
function TimelineRowView(props: { row: TimelineRow }) {
	if (props.row.kind === 'month') {
		return <MonthHeader month={props.row.month} />;
	}

	return <Entry post={props.row.post} />;
}

export default function Timeline() {
	// 캐시가 있으면 fetcher가 배열을 동기로 돌려줘 리소스가 로딩 없이 바로 준비된다.
	const [posts] = createResource(getPostsCached);
	const rows = createMemo(() => buildTimelineRows(posts() ?? []));

	return (
		<section class="timeline px-4 py-8">
			<Show when={posts.loading}>
				<LoadingHeart label="기록을 불러오는 중" />
			</Show>

			<Show when={posts.error}>
				<p class="px-4 py-10 text-sm opacity-80">
					{posts.error instanceof Error ? posts.error.message : '목록을 불러오지 못했어요.'}
				</p>
			</Show>

			<Show when={!posts.loading && !posts.error}>
				<Show
					when={rows().length > 0}
					fallback={<p class="rule-b px-4 py-6 text-sm opacity-70">아직 기록이 없어요.</p>}
				>
					<For each={rows()}>{(row) => <TimelineRowView row={row} />}</For>
				</Show>
			</Show>
		</section>
	);
}
