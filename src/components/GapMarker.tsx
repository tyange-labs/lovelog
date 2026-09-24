// 글 사이가 오래 벌어질수록 여백도 커진다. 메모의 좌우·기울기는 날수에서 뽑는데,
// 간격은 짝수 날이 많아 단순 홀짝으로 가르면 한쪽으로만 몰린다.
export default function GapMarker(props: { days: number }) {
	const left = () => Math.floor(props.days * 2.618) % 2 === 1;

	return (
		<div
			class="gap-note"
			style={{
				height: `${Math.min(28 + props.days * 2, 220)}px`,
				'justify-content': left() ? 'flex-start' : 'flex-end'
			}}
		>
			<span style={{ '--tilt': left() ? '4deg' : '-5deg' }}>{props.days}일 뒤</span>
		</div>
	);
}
