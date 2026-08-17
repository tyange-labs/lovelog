import { createFileRoute } from '@tanstack/react-router';
import Cover from '#/components/Cover';
import LogList from '#/components/LogList';
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
			<Cover />
			<div className="page-rest">
				<LogList posts={posts} />
				<section id="rsvp" className="rule-t scroll-mt-14">
					<header className="px-4 pt-8">
						<h2 className="text-lg font-bold text-[var(--color-accent)]">참석 알리기</h2>
						<p className="mt-2 text-sm opacity-80">
							식사와 자리를 준비하는 데 참고할게요. 이름과 동반 인원만 남겨주시면 됩니다.
						</p>
					</header>
					<RsvpForm />
				</section>
			</div>
		</>
	);
}
