import { getPost } from './cms';
import { renderMarkdown } from './markdown';
import { plainLength } from './timeline';

export interface PostBody {
	html: string;
	length: number;
}

// 행이 처음 뷰포트에 들어올 때만 부르고, Promise를 모듈 스코프에 캐시해 재진입·재호출에도
// 요청이 한 번만 나가게 한다. 실패하면 캐시에서 지워 다음 호출이 재시도하게 한다.
const bodyCache = new Map<string, Promise<PostBody>>();

// 이미 받아온 본문은 동기로도 꺼낼 수 있게 따로 둔다. 글 페이지에서 타임라인으로 돌아왔을 때
// 행이 로딩 상태로 한 번 줄었다가 늘어나면 스크롤 복원 위치가 어긋난다.
const resolvedBodies = new Map<string, PostBody>();

export function peekBody(postId: string): PostBody | undefined {
	return resolvedBodies.get(postId);
}

export function loadBody(postId: string): Promise<PostBody> {
	const cached = bodyCache.get(postId);
	if (cached) {
		return cached;
	}

	const pending = getPost(postId)
		.then((post) => {
			if (!post) {
				throw new Error('글을 찾을 수 없어요.');
			}
			const body = { html: renderMarkdown(post.content), length: plainLength(post.content) };
			resolvedBodies.set(postId, body);
			return body;
		})
		.catch((error: unknown) => {
			bodyCache.delete(postId);
			throw error;
		});

	bodyCache.set(postId, pending);
	return pending;
}
