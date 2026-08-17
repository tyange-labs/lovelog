import { motion } from 'motion/react';
import { PHOTOS } from '#/lib/photos';

// motion.dev/examples/react-scroll-triggered 패턴.
// 카드가 아래에서 살짝 기운 채 올라와 스프링으로 자리를 잡는다.
// 관찰은 움직이지 않는 바깥 요소가 맡고 안쪽 자식만 움직인다 —
// 움직이는 요소가 스스로를 관찰하면 밀려난 채 가시성 조건을 못 채워 영영 잠긴다.
const cardVariants = {
	offscreen: { y: 220, rotate: -4, opacity: 0 },
	onscreen: {
		y: 0,
		rotate: 0,
		opacity: 1,
		transition: { type: 'spring', bounce: 0.4, duration: 0.8 }
	}
} as const;

const SLIDE_CLASS = 'photo-slide relative h-[calc(100svh-3.5rem)] w-full overflow-hidden';

export default function PhotoStack() {
	const [cover, ...rest] = PHOTOS;

	return (
		<section aria-label="웨딩 화보">
			{/* 커버는 첫 화면이라 이미 자리에 있어야 한다. 등장 애니메이션을 걸지 않는다. */}
			<div className={SLIDE_CLASS}>
				<img
					src={cover.src}
					alt={cover.alt}
					loading="eager"
					decoding="async"
					className="absolute inset-0 h-full w-full object-cover"
				/>
			</div>

			{rest.map((photo) => (
				<motion.div
					key={photo.src}
					className={SLIDE_CLASS}
					initial="offscreen"
					whileInView="onscreen"
					viewport={{ amount: 0.5 }}
				>
					<motion.div className="absolute inset-0" variants={cardVariants}>
						<img
							src={photo.src}
							alt={photo.alt}
							loading="lazy"
							decoding="async"
							className="h-full w-full object-cover"
						/>
					</motion.div>
				</motion.div>
			))}
		</section>
	);
}
