import { useState } from 'react';
import { COMPANIONS_MAX, NAME_MAX_LENGTH, submitRsvp, validateRsvp } from '#/lib/rsvp';

export default function RsvpForm() {
	const [name, setName] = useState('');
	const [companions, setCompanions] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDone, setIsDone] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const submission = { name, companions };
		const validationError = validateRsvp(submission);

		if (validationError) {
			setError(validationError);
			return;
		}

		setError(null);
		setIsSubmitting(true);

		try {
			await submitRsvp(submission);
			setIsDone(true);
		} catch (cause: unknown) {
			setError(
				cause instanceof Error ? cause.message : '제출에 실패했어요. 잠시 후 다시 시도해 주세요.'
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	if (isDone) {
		return (
			<div className="flex flex-col items-center gap-[calc(30*var(--u))]">
				<p className="info-body text-center">
					{name.trim()}님{companions > 0 && ` 외 ${companions}명`}, 그날 뵐게요.
				</p>
				<button
					type="button"
					className="info-button"
					onClick={() => {
						setName('');
						setCompanions(0);
						setIsDone(false);
					}}
				>
					다시 작성하기
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-[calc(30*var(--u))]">
			<input
				value={name}
				onChange={(event) => setName(event.target.value)}
				maxLength={NAME_MAX_LENGTH}
				placeholder="성함입력"
				aria-label="성함"
				className="info-field"
			/>

			<label className="flex flex-col gap-[calc(12*var(--u))]">
				<span className="info-body">동반 인원 (본인 제외)</span>
				<input
					type="number"
					inputMode="numeric"
					min={0}
					max={COMPANIONS_MAX}
					value={companions}
					onChange={(event) => setCompanions(Number(event.target.value))}
					className="info-field"
				/>
			</label>

			{error && <p className="info-body">{error}</p>}

			<button type="submit" disabled={isSubmitting} className="info-button">
				{isSubmitting ? '보내는 중…' : '참석 알리기'}
			</button>
		</form>
	);
}
