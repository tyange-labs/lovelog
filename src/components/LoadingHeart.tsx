export default function LoadingHeart(props: { label?: string }) {
	return (
		<div role="status" aria-live="polite" class="flex items-center justify-center py-8">
			<svg
				width="40"
				height="40"
				viewBox="0 0 65 65"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				class="loading-heart"
			>
				<path
					d="M30 65H37.5V62.5H45V60H50V57.5H52.5V55H55V52.5H57.5V50H60V45H62.5V37.5H65V27.5H62.5V20H60V15H57.5V12.5H55V10H52.5V7.5H50V5H45V2.5H37.5V0H27.5V2.5H20V5H15V7.5H12.5V10H10V12.5H7.5V15H5V20H2.5V27.5H0V37.5H2.5V45H5V50H7.5V52.5H10V55H12.5V57.5H15V60H20V62.5H27.5V65H30ZM15 25V22.5H17.5V20H20V17.5H27.5V20H30V22.5H35V20H37.5V17.5H45V20H47.5V22.5H50V32.5H47.5V35H45V37.5H42.5V40H40V42.5H37.5V45H35V47.5H30V45H27.5V42.5H25V40H22.5V37.5H20V35H17.5V32.5H15V25Z"
					fill="var(--color-accent)"
				/>
			</svg>
			<span class="sr-only">{props.label ?? '불러오는 중'}</span>
		</div>
	);
}
