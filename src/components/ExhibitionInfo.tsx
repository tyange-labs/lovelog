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
	['전시명', 'THE LOVELOG ~김혜원 ✕ 유태양 결혼전시회~'],
	['전시일', '2026.09.19 (토)'],
	['전시장소', '서울시 마포구 토정로 34']
];

const NOTES = [
	'드레스 코드는 본인이 가장 좋아하는 옷입니다. 흰색 옷, 드레스, 비키니 뭐든 상관없으니 가장 아끼고 좋아하는 옷을 입고 오셔서 자리를 빛내주세요.',
	'현장에서 축의는 받지 않습니다.',
	'주차는 ‘양화진공영주차장’에 하시면 됩니다.',
	'11시부터 5시까지 전시장을 오픈할 예정입니다. 그 안에 자유롭게 방문하시되 오시는 시간을 미리 알려주시기 바랍니다.'
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
			<img
				className="info-poster"
				src="/poster.jpg"
				width={1000}
				height={1250}
				alt="THE LOVELOG 김혜원 ✕ 유태양 결혼전시회 포스터. 2026.09.19 (토), 서울시 마포구 토정로 34."
			/>

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
				<ul className="info-notes">
					{NOTES.map((note) => (
						<li key={note}>{note}</li>
					))}
				</ul>
			</div>

			<div id="rsvp" className="info-block">
				<h2 className="info-title">오시는 분</h2>
				<RsvpForm />
			</div>

			<div className="info-block info-closing">
				<p>THE LOVELOG</p>
				<p>김혜원 ✕ 유태양</p>
			</div>

			<footer className="info-footer">
				©{' '}
				<a href="https://github.com/tyange" target="_blank" rel="noreferrer">
					tyange
				</a>{' '}
				{new Date().getFullYear()}
			</footer>

			<div aria-hidden="true" className="info-snap-end" />
		</section>
	);
}
