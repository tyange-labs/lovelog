const LOVELOG_CATEGORY = 'general';
const LOVELOG_TAGS = new Set(['love', 'lovelog']);

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

export function isLovelogPost(post: PostListItem): boolean {
	return post.tags.some((t) => t.category === LOVELOG_CATEGORY && LOVELOG_TAGS.has(t.tag));
}

export async function getPosts(): Promise<PostListItem[]> {
	const res = await fetch(`${CMS_API_BASE}/posts`);
	if (!res.ok) {
		throw new Error(`목록을 불러오지 못했어요 (${res.status})`);
	}
	const body: PostsResponse = await res.json();
	const posts = body.data?.posts ?? [];
	return posts.filter(isLovelogPost);
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
