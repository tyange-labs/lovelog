export interface Photo {
	src: string;
	alt: string;
}

// 슬라이드 순서는 파일명이 아니라 시안의 캔버스 배치(왼쪽 → 오른쪽)를 따른다.
// 5번과 8번이 서로 자리를 바꿔 놓여 있고, 시안의 프레임 사본 네 벌이 모두 같은 배치다.
const SLIDE_ORDER = [1, 2, 3, 4, 8, 6, 7, 5];

export const PHOTOS: Photo[] = SLIDE_ORDER.map((photoNumber, index) => ({
	src: `/photos/photo-${photoNumber}.jpg`,
	alt: `웨딩 화보 ${index + 1}번째 사진`
}));
