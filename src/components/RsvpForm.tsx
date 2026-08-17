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
			<div className="px-4 py-10 text-center">
				<p className="text-lg font-bold text-[var(--color-accent)]">참석 명단에 담았어요</p>
				<p className="mt-2 text-sm opacity-80">
					{name.trim()}님{companions > 0 && ` 외 ${companions}명`}, 그날 뵐게요.
				</p>
				<button
					type="button"
					className="mt-6 border border-[var(--color-accent)] px-4 py-2 text-sm text-[var(--color-accent)]"
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
		<form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-8">
			<label className="flex flex-col gap-2">
				<span className="text-sm font-bold text-[var(--color-accent)]">이름</span>
				<input
					value={name}
					onChange={(event) => setName(event.target.value)}
					maxLength={NAME_MAX_LENGTH}
					placeholder="홍길동"
					className="border-b border-[var(--color-accent)] bg-transparent py-2 outline-none placeholder:opacity-40"
				/>
			</label>

			<label className="flex flex-col gap-2">
				<span className="text-sm font-bold text-[var(--color-accent)]">동반 인원</span>
				<input
					type="number"
					inputMode="numeric"
					min={0}
					max={COMPANIONS_MAX}
					value={companions}
					onChange={(event) => setCompanions(Number(event.target.value))}
					className="w-24 border-b border-[var(--color-accent)] bg-transparent py-2 outline-none"
				/>
				<span className="text-xs opacity-60">본인을 제외한 인원 수</span>
			</label>

			{error && <p className="text-sm text-[var(--color-accent)]">{error}</p>}

			<button
				type="submit"
				disabled={isSubmitting}
				className="mt-2 border border-[var(--color-accent)] py-3 font-bold text-[var(--color-accent)] disabled:opacity-50"
			>
				{isSubmitting ? '보내는 중…' : '참석 알리기'}
			</button>
		</form>
	);
}
