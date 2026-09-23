export default function MonthHeader(props: { month: string }) {
	return (
		<div class="month-header">
			<span>{props.month}</span>
		</div>
	);
}
