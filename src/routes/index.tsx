import { createFileRoute } from '@tanstack/react-router';
import LogDrawer from '#/components/LogDrawer';
import PhotoStack from '#/components/PhotoStack';
import ScrollNudge from '#/components/ScrollNudge';
import RsvpForm from '#/components/RsvpForm';
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
			<section id="rsvp" className="page-rest rule-t">
				<header className="px-4 pt-8">
					<h2 className="text-lg font-bold text-[var(--color-accent)]">참석 알리기</h2>
					<p className="mt-2 text-sm opacity-80">
						식사와 자리를 준비하는 데 참고할게요. 이름과 동반 인원만 남겨주시면 됩니다.
					</p>
				</header>
				<RsvpForm />
			</section>
			<LogDrawer posts={posts} />
		</>
	);
}
