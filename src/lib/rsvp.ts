export interface RsvpSubmission {
	name: string;
	companions: number;
}

export const NAME_MAX_LENGTH = 20;
export const COMPANIONS_MAX = 10;

export function validateRsvp(submission: RsvpSubmission): string | null {
	const name = submission.name.trim();

	if (name.length === 0) {
		return '이름을 입력해 주세요.';
	}
	if (name.length > NAME_MAX_LENGTH) {
		return `이름은 ${NAME_MAX_LENGTH}자까지 입력할 수 있어요.`;
	}
	if (!Number.isInteger(submission.companions)) {
		return '동반 인원을 숫자로 입력해 주세요.';
	}
	if (submission.companions < 0 || submission.companions > COMPANIONS_MAX) {
		return `동반 인원은 0명에서 ${COMPANIONS_MAX}명 사이로 입력해 주세요.`;
	}

	return null;
}

// 백엔드 라우트(POST /public/wedding/guests)는 아직 승인 전이라 실제 전송을 하지 않는다.
// 승인 후 이 함수 본문만 fetch 호출로 교체하면 되고, 호출부는 바뀌지 않는다.
export async function submitRsvp(submission: RsvpSubmission): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 400));
	console.info('[rsvp stub] 제출 예정 데이터', {
		name: submission.name.trim(),
		companions: submission.companions
	});
}
