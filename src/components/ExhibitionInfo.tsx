import RsvpForm from './RsvpForm';

const INTRO_LINES = [
	'THE LOVELOG : 푸르른 틈새',
	'우리 사이에는 얼마나 많은 우주가 있었을까? 이 전시는 서로 다른 우주에서 모순 없이 살아온 우리가 우연히 만나 생겨난 ‘우리의‘ 우주에 대한 기록이다. Chapter 1은 각자의 우주에 살았던 우리의 모습을 같은 시간의 흐름 위에 보여준다. Chapter 2는 만남으로 인해 서로의 우주가 충돌하면서 생긴 모순과 균열을 보여주며 서로의 틈새로 스며든 새로운 우주를 보여준다. Chapter 3는 관람객들이 새로운 우주 탄생의 증인이 되는 공간이다. Chapter 3에서 관람객들은 이 전시를 단순히 관람하기에 그치는 것이 아니라 우리의 기록에 대해 동참하게 되며 새로운 틈새가 된다.'
];

const CHAPTERS = [
	{
		title: '<Chapter 1: 모순 없는 진행>',
		lines: ['우리는 서로 다른 우주에서 같은 시간 위에 있었다.']
	},
	{
		title: '<Chapter 2: 푸르른 틈새로 스며든 서로의 우주>',
		lines: ['‘푸르른 틈새’로 시작된 우리의 새롭고 푸르른 우주.']
	},
	{
		title: '<Chapter 3: 다른 틈새>',
		lines: ['새롭게 탄생한 우리의 우주의 또 다른 틈새가 되어달라는 초대.']
	}
];

const DETAILS = [
	['전시명', 'THE LOVELOG ~김혜원x유태양 결혼전시회~'],
	['전시일', '2026.09.19 (토)'],
	['운영시간', '오전 10 - 오후 8시 (신랑 신부 대기시간)'],
	['고객센터', '010-XXXX-XXXX 김혜원'],
	['전시장소', '서울시 마포구 토성로 34']
];

const ACCOUNTS = [
	['신부측', '토스 1234-141414 김혜원'],
	['신랑측', '토스 1234-141414 유태양']
];

function Pairs({ rows }: { rows: string[][] }) {
	return (
		<dl className="info-pairs">
			{rows.map(([label, value]) => (
				<div key={label} className="contents">
					<dt>{label}</dt>
					<dd>{value}</dd>
				</div>
			))}
		</dl>
	);
}

export default function ExhibitionInfo() {
	return (
		<section id="info" className="page-rest info-page rule-t">
			<div className="info-block">
				<h2 className="info-title">전시 소개</h2>
				<div>
					{INTRO_LINES.map((line) => (
						<p key={line} className="info-body">
							{line}
						</p>
					))}
				</div>
			</div>

			<div className="info-block">
				<h2 className="info-title">전시장 안내</h2>
				<div>
					{CHAPTERS.map((chapter) => (
						<p key={chapter.title} className="info-body">
							{chapter.title}
							{chapter.lines.map((line) => (
								<span key={line}>
									<br />
									{line}
								</span>
							))}
						</p>
					))}
				</div>
			</div>

			<div className="info-block">
				<Pairs rows={DETAILS} />
			</div>

			<div id="rsvp" className="info-block">
				<h2 className="info-title">오시는 분</h2>
				<RsvpForm />
			</div>

			<div className="info-block">
				<h2 className="info-title">계좌정보</h2>
				<Pairs rows={ACCOUNTS} />
			</div>

			<div className="info-block info-closing">
				<p>우리는 계속 사랑하고, 계속 기록합니다.</p>
				<p className="mt-[calc(60*var(--u))]">THE LOVELOG</p>
				<p>김혜원 X 유태양</p>
			</div>
		</section>
	);
}
