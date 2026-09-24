export default function MonthHeader(props: { month: string }) {
	const tilt = () => (Number(props.month.slice(-2)) % 2 ? 3 : -4);

	return (
		<div class="month-stamp-row">
			<span class="month-stamp" style={{ '--tilt': `${tilt()}deg` }}>
				{props.month}
			</span>
		</div>
	);
}
