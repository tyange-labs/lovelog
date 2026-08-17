import { PHOTOS } from '#/lib/photos';

function ScrollHint() {
	return (
		<svg
			viewBox="0 0 24 116"
			width="20"
			aria-hidden="true"
			className="absolute top-[46%] left-1/2 -translate-x-1/2 fill-[var(--color-accent)]"
		>
			{[0, 1, 2, 3].map((step) => (
				<polygon key={step} points={`12,${step * 32} 24,${step * 32 + 20} 0,${step * 32 + 20}`} />
			))}
		</svg>
	);
}

export default function Cover() {
	return (
		<section aria-label="웨딩 화보">
			{PHOTOS.map((photo, index) => (
				<div key={photo.src} className="photo-slide relative h-[calc(100svh-3.5rem)] w-full">
					<img
						src={photo.src}
						alt={photo.alt}
						loading={index === 0 ? 'eager' : 'lazy'}
						decoding="async"
						className="absolute inset-0 h-full w-full object-cover"
					/>

					{index === 0 && (
						<>
							<div className="absolute inset-0 bg-[var(--overlay-cover)]" aria-hidden="true" />
							<ScrollHint />
						</>
					)}
				</div>
			))}
		</section>
	);
}
