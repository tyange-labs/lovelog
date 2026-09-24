// 글 사이가 오래 벌어질수록 여백도 커진다. 글자로 적지 않고 빈 공간으로만 보여준다.
export default function GapMarker(props: { days: number }) {
	return <div aria-hidden="true" style={{ height: `${Math.min(28 + props.days * 2, 220)}px` }} />;
}
