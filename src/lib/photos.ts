export interface Photo {
	src: string;
	alt: string;
}

export const PHOTOS: Photo[] = Array.from({ length: 8 }, (_, index) => ({
	src: `/photos/photo-${index + 1}.jpg`,
	alt: `웨딩 화보 ${index + 1}번째 사진`
}));
