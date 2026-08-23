import RsvpForm from './RsvpForm';

const INTRO_LINES = [
	'THE LOVE LOG',
	'서로를 알기 전에도 각자의 시간은 흐르고 있었다.',
	'서로 다른 장소에서, 서로 다른 순간을 살아온 두 사람의 기록은 어느 순간 만나 하나의 시간으로 이어진다. THE LOVE LOG는 각자의 과거에서 시작해 서로를 만나고, 함께 바라보고, 기록해온 순간들을 따라가는 전시다. 사진과 영상, 글과 사적인 기록들을 통해 두 사람의 시간이 어떻게 하나의 세계를 만들어왔는지 펼쳐 보인다. 그리고 그 기록의 끝에서, 전시를 바라본 당신 역시 우리의 시간을 함께 목격한 한 사람으로 남는다.'
];

const CHAPTERS = [
	{
		title: '<Chapter 1: 모순 없는 진행>',
		lines: [
			'서로 다른 곳에서 흘러온 두 사람의 시간을 같은 시간 위에 나란히 놓는다.',
			'각자의 과거가 하나의 현재로 이어지는 과정의 기록.'
		]
	},
	{
		title: '<Chapter 2: 우리가 겪는 것은 우리의 우주>',
		lines: [
			'함께 겪고 바라본 순간들이 쌓여 둘만의 하나의 우주가 된다.',
			'두 사람의 시선으로 기록한 가장 가까운 세계.'
		]
	},
	{
		title: '<Chapter 3: 기록의 증인>',
		lines: ['두 사람의 시간을 지나온 당신은', '이제 이 기록의 증인이 된다.']
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
				<p className="mt-[calc(60*var(--u))]">THE LOVE LOG</p>
				<p>김혜원 X 유태양</p>
			</div>
		</section>
	);
}
