import { createFileRoute } from '@tanstack/react-router';
import LogDrawer from '#/components/LogDrawer';
import PhotoStack from '#/components/PhotoStack';
import ScrollNudge from '#/components/ScrollNudge';
import ExhibitionInfo from '#/components/ExhibitionInfo';
import { getPosts } from '#/lib/cms';

export const Route = createFileRoute('/')({
	loader: () => getPosts(),
	component: InvitationPage,
	pendingComponent: () => <p className="px-4 py-10 text-sm opacity-70">불러오는 중…</p>,
	errorComponent: ({ error }) => (
		<p className="px-4 py-10 text-sm opacity-80">
			{error instanceof Error ? error.message : '목록을 불러오지 못했어요.'}
		</p>
	)
});

function InvitationPage() {
	const posts = Route.useLoaderData();

	return (
		<>
			<PhotoStack />
			<ScrollNudge />
			<ExhibitionInfo />
			<LogDrawer posts={posts} />
		</>
	);
}
