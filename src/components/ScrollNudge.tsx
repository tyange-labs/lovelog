import { motion } from 'motion/react';

const CHEVRON_COUNT = 4;

export default function ScrollNudge() {
	return (
		<motion.div
			className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--overlay-cover)]"
			initial={{ y: 0, opacity: 1 }}
			exit={{ y: '-100%', opacity: 0 }}
			transition={{ type: 'spring', stiffness: 260, damping: 30 }}
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
			<p className="sr-only">위로 밀어 다음 사진을 볼 수 있습니다.</p>
		</motion.div>
	);
}
