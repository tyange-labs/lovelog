import { useId, useState } from 'react';
import {
	COMPANIONS_MAX,
	NAME_MAX_LENGTH,
	VISIT_HOURS,
	submitRsvp,
	validateRsvp,
	visitHourLabel
} from '#/lib/rsvp';

export default function RsvpForm() {
	const nameId = useId();
	const [name, setName] = useState('');
	const [companions, setCompanions] = useState(0);
	const [visitHour, setVisitHour] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [done, setDone] = useState<{ name: string; companions: number; visitHour: number } | null>(
		null
	);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const submission = { name, companions, visitHour };
		const validationError = validateRsvp(submission);

		if (validationError) {
			setError(validationError);
			return;
		}

		setError(null);
		setIsSubmitting(true);

		try {
			await submitRsvp(submission);
			setDone({ name: name.trim(), companions, visitHour: visitHour as number });
		} catch (cause: unknown) {
			setError(
				cause instanceof Error ? cause.message : '제출에 실패했어요. 잠시 후 다시 시도해 주세요.'
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	if (done) {
		return (
			<div className="rsvp-done">
				<p className="rsvp-done-line">
					{done.name}님{done.companions > 0 && ` 외 ${done.companions}명`}
				</p>
				<p className="rsvp-done-strong">{visitHourLabel(done.visitHour)}에 뵐게요</p>
				<button
					type="button"
					className="rsvp-quiet-button"
					onClick={() => {
						setName('');
						setCompanions(0);
						setVisitHour(null);
						setDone(null);
					}}
				>
					다른 분도 알리기
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="rsvp-form" noValidate>
			<div className="rsvp-group">
				<label className="rsvp-label" htmlFor={nameId}>
					성함
				</label>
				<input
					id={nameId}
					value={name}
					onChange={(event) => setName(event.target.value)}
					maxLength={NAME_MAX_LENGTH}
					autoComplete="name"
					enterKeyHint="done"
					placeholder="김하객"
					className="info-field"
				/>
			</div>

			<div className="rsvp-group">
				<span className="rsvp-label">함께 오시는 분</span>
				<div className="rsvp-stepper">
					<button
						type="button"
						className="rsvp-step"
						onClick={() => setCompanions((value) => Math.max(0, value - 1))}
						disabled={companions === 0}
						aria-label="함께 오시는 분 한 명 줄이기"
					>
						−
					</button>
					<output className="rsvp-count" aria-live="polite">
						{companions === 0 ? '저 혼자예요' : `${companions}명`}
					</output>
					<button
						type="button"
						className="rsvp-step"
						onClick={() => setCompanions((value) => Math.min(COMPANIONS_MAX, value + 1))}
						disabled={companions === COMPANIONS_MAX}
						aria-label="함께 오시는 분 한 명 늘리기"
					>
						+
					</button>
				</div>
			</div>

			<div className="rsvp-group">
				<span className="rsvp-label" id={`${nameId}-visit`}>
					방문 예정 시간
				</span>
				<div className="rsvp-chips" role="radiogroup" aria-labelledby={`${nameId}-visit`}>
					{VISIT_HOURS.map((hour) => (
						<label key={hour} className="rsvp-chip">
							<input
								type="radio"
								name="visit-hour"
								className="sr-only"
								checked={visitHour === hour}
								onChange={() => {
									setVisitHour(hour);
									setError(null);
								}}
							/>
							{visitHourLabel(hour)}
						</label>
					))}
				</div>
			</div>

			{error && (
				<p className="rsvp-error" role="alert">
					{error}
				</p>
			)}

			<button type="submit" disabled={isSubmitting} className="info-button">
				{isSubmitting ? '보내는 중…' : '참석 알리기'}
			</button>
		</form>
	);
}
