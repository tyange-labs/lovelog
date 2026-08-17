import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PHOTOS } from '#/lib/photos';
import ScrollNudge from './ScrollNudge';

// Tinder 스와이프와 같은 판정: 충분히 끌었거나(offset), 짧아도 세게 튕겼으면(velocity) 넘긴다.
const OFFSET_THRESHOLD = 90;
const VELOCITY_THRESHOLD = 450;

const SPRING = { type: 'spring', stiffness: 300, damping: 34 } as const;

// direction > 0 은 다음 사진(위로 밀기). 새 카드는 아래에서 올라오고 이전 카드는 위로 빠진다.
const variants = {
	enter: (direction: number) => ({ y: direction > 0 ? '100%' : '-100%' }),
	center: { y: 0 },
	exit: (direction: number) => ({ y: direction > 0 ? '-100%' : '100%' })
};

function preload(index: number) {
	const photo = PHOTOS[index];
	if (photo) {
		new Image().src = photo.src;
	}
}

export default function PhotoStack() {
	const [[index, direction], setState] = useState<[number, number]>([0, 0]);
	const [hasNudged, setHasNudged] = useState(false);

	useEffect(() => {
		preload(index + 1);
		preload(index - 1);
	}, [index]);

	function go(next: number, dir: number) {
		setState([next, dir]);
	}

	function handleDragEnd(_: unknown, info: { offset: { y: number }; velocity: { y: number } }) {
		const swipedUp = info.offset.y < -OFFSET_THRESHOLD || info.velocity.y < -VELOCITY_THRESHOLD;
		const swipedDown = info.offset.y > OFFSET_THRESHOLD || info.velocity.y > VELOCITY_THRESHOLD;

		// 첫 위로 밀기는 넛지를 걷어내는 데만 쓴다. 이 동작 자체가 "위로 밀면 넘어간다"를 알려준다.
		if (swipedUp && !hasNudged) {
			setHasNudged(true);
			return;
		}

		if (swipedUp) {
			if (index < PHOTOS.length - 1) {
				go(index + 1, 1);
				return;
			}
			document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			return;
		}

		if (swipedDown && index > 0) {
			go(index - 1, -1);
		}
	}

	const photo = PHOTOS[index];

	return (
		<section
			aria-label="웨딩 화보"
			className="relative h-[calc(100svh-3.5rem)] w-full overflow-hidden"
		>
			<AnimatePresence initial={false} custom={direction}>
				<motion.div
					key={photo.src}
					className="absolute inset-0"
					custom={direction}
					variants={variants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={SPRING}
					drag="y"
					dragConstraints={{ top: 0, bottom: 0 }}
					dragElastic={0.25}
					dragMomentum={false}
					onDragEnd={handleDragEnd}
				>
					<img
						src={photo.src}
						alt={photo.alt}
						draggable={false}
						className="pointer-events-none h-full w-full object-cover select-none"
					/>
				</motion.div>
			</AnimatePresence>

			<AnimatePresence>{!hasNudged && <ScrollNudge />}</AnimatePresence>
		</section>
	);
}
