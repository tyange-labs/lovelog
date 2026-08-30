import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const CHEVRON_COUNT = 4;
const FADE_MS = 800;

// 입력이 멎었다고 볼 만한 간격. 트랙패드 관성은 이보다 촘촘하게 이어진다.
const QUIET_MS = 260;

// 흡수막이 남아 있을 수 있는 최대 시간. 이게 없으면 사용자가 계속 스크롤을 시도할 때마다
// 정적 타이머가 리셋되어 넛지가 영영 사라지지 않는 라이브락에 빠진다.
const MAX_ABSORB_MS = 500;

// 사진 스택과 완전히 분리된 고정 레이어.
// 넛지에서 시작된 입력은 넛지 안에서 끝낸다. 페이드가 끝나도 곧바로 사라지지 않고,
// 입력이 멎을 때까지 투명한 흡수막으로 남는다 — 트랙패드는 플릭 한 번에 관성으로 wheel을
// 1초 가까이 쏟아내는데, 페이드만 끝났다고 걷어내면 잔여분이 스택에 닿아 한 장 더 넘어간다.
export default function ScrollNudge() {
	const [isDismissing, setIsDismissing] = useState(false);
	const [isMounted, setIsMounted] = useState(true);
	const layerRef = useRef<HTMLDivElement>(null);
	const startedAt = useRef(0);
	const quietTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const hardTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

	const begin = useCallback(() => {
		if (!startedAt.current) {
			startedAt.current = Date.now();
			setIsDismissing(true);
			hardTimer.current = setTimeout(() => setIsMounted(false), FADE_MS + MAX_ABSORB_MS);
		}

		clearTimeout(quietTimer.current);
		const remainingFade = Math.max(0, FADE_MS - (Date.now() - startedAt.current));
		quietTimer.current = setTimeout(() => setIsMounted(false), Math.max(QUIET_MS, remainingFade));
	}, []);

	useEffect(() => {
		const node = layerRef.current;
		if (!node) {
			return;
		}

		function absorb(event: Event) {
			event.preventDefault();
			event.stopPropagation();
			begin();
		}

		node.addEventListener('wheel', absorb, { passive: false });
		node.addEventListener('touchmove', absorb, { passive: false });

		return () => {
			node.removeEventListener('wheel', absorb);
			node.removeEventListener('touchmove', absorb);
		};
	}, [begin]);

	// 잠금 해제를 애니메이션 콜백에 기대지 않는다. 상태에 직접 묶어야 확실하게 풀린다.
	useEffect(() => {
		const root = document.documentElement;
		if (isMounted) {
			root.classList.add('nudge-open');
		} else {
			root.classList.remove('nudge-open');
		}
	}, [isMounted]);

	useEffect(
		() => () => {
			clearTimeout(quietTimer.current);
			clearTimeout(hardTimer.current);
			document.documentElement.classList.remove('nudge-open');
		},
		[]
	);

	if (!isMounted) {
		return null;
	}

	return (
		<motion.div
			ref={layerRef}
			className="nudge-layer"
			initial={{ opacity: 1 }}
			animate={{ opacity: isDismissing ? 0 : 1 }}
			transition={{ duration: FADE_MS / 1000, ease: 'easeOut' }}
			onClick={(event) => {
				event.stopPropagation();
				begin();
			}}
			onTouchStart={(event) => {
				event.stopPropagation();
				begin();
			}}
		>
			<div className="flex flex-col items-center gap-2" aria-hidden="true">
				{Array.from({ length: CHEVRON_COUNT }, (_, index) => (
					<motion.svg
						key={index}
						viewBox="0 0 24 14"
						width="15"
						className="fill-[var(--color-accent)]"
						animate={{ y: [6, -6, 6], opacity: [0.25, 1, 0.25] }}
						transition={{
							duration: 1.8,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'easeInOut',
							delay: (CHEVRON_COUNT - 1 - index) * 0.12
						}}
					>
						<polygon points="12,0 24,14 0,14" />
					</motion.svg>
				))}
			</div>
			<p className="sr-only">화면을 누르거나 스크롤하면 사진을 넘길 수 있습니다.</p>
		</motion.div>
	);
}
