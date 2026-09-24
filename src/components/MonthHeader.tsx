import { scrapPose } from '#/lib/timeline';

// 카드와 같은 방식으로 흩되, 스탬프는 좀 더 과감하게 기울인다(±3.5°).
export default function MonthHeader(props: { month: string }) {
	const pose = () => scrapPose(`month:${props.month}`);

	return (
		<div class="scatter-row month-stamp-row" style={{ '--shift': `${pose().shift}` }}>
			<span class="month-stamp" style={{ '--tilt': `${pose().tilt * 2.5}deg` }}>
				{props.month}
			</span>
		</div>
	);
}
