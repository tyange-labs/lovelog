export default function GapMarker(props: { days: number }) {
	return (
		<div class="gap-marker">
			<div class="gap-rail" aria-hidden="true" />
			<span class="gap-label">{props.days}일 뒤</span>
		</div>
	);
}
