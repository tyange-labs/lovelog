const LOVELOG_CATEGORY = 'general';
const LOVELOG_TAGS = new Set(['love', 'lovelog']);

// 타임라인에서 내리고 싶은 글에 붙이는 태그. 카테고리를 가리지 않고 이 태그 하나로 뺀다.
// 거르는 일은 서버(/posts/search-with-tags?exclude=)가 하고, 아래 isArchivedPost는
// 주소가 바뀌거나 파라미터가 빠졌을 때를 대비한 2차 방어선이다.
const ARCHIVED_TAG = 'archive';

export const CMS_API_BASE = import.meta.env.VITE_CMS_API_BASE ?? 'https://tyange.com/api/cms';

export interface Tag {
	tag: string;
	category: string;
}

export interface PostListItem {
	post_id: string;
	title: string;
	description: string;
	published_at: string;
	tags: Tag[];
	status: string;
}

export interface Post extends PostListItem {
	content: string;
}

interface PostsResponse {
	status: boolean;
	data: { posts: PostListItem[] } | null;
	message: string | null;
}

export function isArchivedPost(post: PostListItem): boolean {
	return post.tags.some((t) => t.tag === ARCHIVED_TAG);
}

export function isLovelogPost(post: PostListItem): boolean {
	if (isArchivedPost(post)) {
		return false;
	}

	return post.tags.some((t) => t.category === LOVELOG_CATEGORY && LOVELOG_TAGS.has(t.tag));
}

// /posts가 아니라 /posts/search-with-tags를 쓴다. exclude가 태그 이름만 보고 카테고리를
// 가리지 않아 archive 규칙과 정확히 맞고, 응답 모양은 /posts와 같다.
// include는 태그를 하나만 받아 love/lovelog + general 카테고리 조건을 표현하지 못하므로
// 그 부분은 isLovelogPost가 그대로 맡는다.
export async function getPosts(): Promise<PostListItem[]> {
	const res = await fetch(
		`${CMS_API_BASE}/posts/search-with-tags?exclude=${encodeURIComponent(ARCHIVED_TAG)}`
	);
	if (!res.ok) {
		throw new Error(`목록을 불러오지 못했어요 (${res.status})`);
	}
	const body: PostsResponse = await res.json();
	const posts = body.data?.posts ?? [];
	return posts.filter(isLovelogPost);
}

// 목록은 한 번만 받아 모듈 스코프에 둔다. 글 페이지에서 돌아왔을 때 값을 동기로 돌려줘야
// 타임라인이 로딩 상태를 거치지 않고 바로 그려지고, 스크롤 복원이 제자리를 찾는다.
let postsCache: PostListItem[] | undefined;

export function getPostsCached(): PostListItem[] | Promise<PostListItem[]> {
	if (postsCache) {
		return postsCache;
	}
	return getPosts().then((posts) => {
		postsCache = posts;
		return posts;
	});
}

export async function getPost(postId: string): Promise<Post | null> {
	const res = await fetch(`${CMS_API_BASE}/post/${postId}`);
	if (res.status === 404) {
		return null;
	}
	if (!res.ok) {
		throw new Error(`글을 불러오지 못했어요 (${res.status})`);
	}
	return res.json();
}
