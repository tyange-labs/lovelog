import { describe, expect, it } from 'vitest';
import { isLovelogPost } from './cms';
import type { PostListItem } from './cms';

function post(tags: PostListItem['tags']): PostListItem {
	return {
		post_id: 'p1',
		title: '창원',
		description: '',
		published_at: '2026-08-04',
		tags,
		status: 'published'
	};
}

describe('isLovelogPost', () => {
	it('general 카테고리의 love/lovelog 태그가 붙은 글만 통과시킨다', () => {
		expect(isLovelogPost(post([{ tag: 'lovelog', category: 'general' }]))).toBe(true);
		expect(isLovelogPost(post([{ tag: 'love', category: 'general' }]))).toBe(true);
	});

	it('카테고리나 태그가 어긋나면 걸러낸다', () => {
		expect(isLovelogPost(post([{ tag: 'lovelog', category: 'dev' }]))).toBe(false);
		expect(isLovelogPost(post([{ tag: 'rust', category: 'general' }]))).toBe(false);
		expect(isLovelogPost(post([]))).toBe(false);
	});
});
