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
			return { html: renderMarkdown(post.content), length: plainLength(post.content) };
		})
		.catch((error: unknown) => {
			bodyCache.delete(postId);
			throw error;
		});

	bodyCache.set(postId, pending);
	return pending;
}
