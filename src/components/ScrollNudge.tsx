import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const CHEVRON_COUNT = 4;

// 사진 슬라이드와 완전히 분리된 고정 레이어.
// 넛지에서 시작된 입력은 넛지 안에서 끝낸다 — preventDefault로 페이지가 움직이지 않게 하고
// stopPropagation으로 바깥까지 새지 않게 한다. 트랙패드는 플릭 한 번에 관성으로 wheel을
// 수십 번 쏟아내는데, 리스너가 페이드 내내 붙어 있어 그 잔여분까지 전부 여기서 흡수한다.
export default function ScrollNudge() {
	const [isVisible, setIsVisible] = useState(true);
	const layerRef = useRef<HTMLDivElement>(null);

	const dismiss = useCallback(() => setIsVisible(false), []);

	useEffect(() => {
		const node = layerRef.current;
		if (!node) {
			return;
		}

		function absorb(event: Event) {
			event.preventDefault();
			event.stopPropagation();
			setIsVisible(false);
		}

		node.addEventListener('wheel', absorb, { passive: false });
		node.addEventListener('touchmove', absorb, { passive: false });

		return () => {
			node.removeEventListener('wheel', absorb);
			node.removeEventListener('touchmove', absorb);
		};
	}, []);

	useEffect(() => {
		document.documentElement.classList.add('nudge-open');
		return () => document.documentElement.classList.remove('nudge-open');
	}, []);

	return (
		<AnimatePresence onExitComplete={() => document.documentElement.classList.remove('nudge-open')}>
			{isVisible && (
				<motion.div
					ref={layerRef}
					className="nudge-layer"
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					onClick={(event) => {
						event.stopPropagation();
						dismiss();
					}}
					onTouchStart={(event) => {
						event.stopPropagation();
						dismiss();
					}}
				>
					<div className="flex flex-col items-center gap-1" aria-hidden="true">
						{Array.from({ length: CHEVRON_COUNT }, (_, index) => (
							<motion.svg
								key={index}
								viewBox="0 0 24 14"
								width="22"
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
			)}
		</AnimatePresence>
	);
}
