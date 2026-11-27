export default function Loading(props: { label?: string }) {
	return (
		<p role="status" aria-live="polite">
			{props.label ?? '불러오는 중…'}
		</p>
	);
}
