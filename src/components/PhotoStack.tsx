import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { Photo } from '#/lib/photos';
import { PHOTOS } from '#/lib/photos';

// 사진은 처음부터 같은 자리·같은 크기로 쌓여 있고, 맨 위 것이 위로 빠지면 이미 그 자리에
// 있던 다음 사진이 드러난다.
//
// 위치를 스크롤 진행도의 순수 함수로 둔다. 인덱스 상태로 넘기면 페이지 스크롤을 잠가야 하고,
// 그러면 화보와 RSVP의 경계마다 잠금·해제·복귀 예외가 끝없이 생긴다. 스크롤에만 의존하면
// 트랙패드·터치·휠·키보드가 전부 그냥 동작하고 되돌아가기도 저절로 대칭이 된다.
const SLIDE_HEIGHT = 'calc(100svh - 3.5rem)';

interface PhotoLayerProps {
	photo: Photo;
	index: number;
	total: number;
	progress: MotionValue<number>;
}

function PhotoLayer({ photo, index, total, progress }: PhotoLayerProps) {
	const segment = 1 / (total - 1);
	const start = index * segment;

	// 마지막 장은 빠지지 않는다. 그 자리에서 RSVP가 이어받는다.
	const isLast = index === total - 1;

	const y = useTransform(progress, [start, start + segment], ['0%', '-105%'], { clamp: true });

	return (
		<motion.div className="absolute inset-0" style={{ zIndex: total - index, y: isLast ? 0 : y }}>
			<img
				src={photo.src}
				alt={photo.alt}
				draggable={false}
				loading={index === 0 ? 'eager' : 'lazy'}
				decoding="async"
				className="h-full w-full object-cover select-none"
			/>
		</motion.div>
	);
}

export default function PhotoStack() {
	const trackRef = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({
		target: trackRef,
		offset: ['start start', 'end end']
	});

	return (
		<section aria-label="웨딩 화보">
			<div
				ref={trackRef}
				className="relative"
				style={{ height: `calc(${PHOTOS.length} * ${SLIDE_HEIGHT})` }}
			>
				<div className="sticky top-14 overflow-hidden" style={{ height: SLIDE_HEIGHT }}>
					{PHOTOS.map((photo, index) => (
						<PhotoLayer
							key={photo.src}
							photo={photo}
							index={index}
							total={PHOTOS.length}
							progress={scrollYProgress}
						/>
					))}
				</div>

				{PHOTOS.map((photo, index) => (
					<div
						key={`snap-${photo.src}`}
						aria-hidden="true"
						className="photo-snap pointer-events-none absolute inset-x-0"
						style={{ top: `calc(${index} * ${SLIDE_HEIGHT})`, height: SLIDE_HEIGHT }}
					/>
				))}
			</div>
		</section>
	);
}
