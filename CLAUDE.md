# lovelog — 모바일 청첩장 + 로그

## 프로젝트 개요

`tyange-love`(SvelteKit 블로그)와 `bosskimwithu`(TanStack Start 청첩장)를 하나로 통합한
프로젝트다. 두 원본은 이 프로젝트가 자리를 잡으면 아카이빙된다.

결혼식은 **전시회 형식**으로 반나절 이상 진행되고 하객이 자유로운 시간대에 방문한다.
사이트는 하객에게 공유되는 공개 페이지이면서, 부부의 로그(블로그)를 함께 담는다.

**현재 단계**: 화보·로그 드로어·RSVP 폼까지 구현됐고 디자인도 대부분 입혀졌다.
RSVP 제출은 백엔드 라우트 승인 전이라 stub이다.

## 기술 스택

- **React 19 + TanStack Router** — 파일 기반 라우팅. Start/Nitro가 아니므로 **SSR이 없는
  순수 정적 SPA**다. 빌드 산출물은 `dist/`
- **Vite 8**, **TypeScript**, **bun**
- **Tailwind CSS 4** (`@tailwindcss/vite`, CSS-first `@theme`)
- **Vitest** + Testing Library
- lint/format: **oxlint** / **oxfmt**
- import alias: `#/*` → `./src/*` (package.json `imports` 필드)

## 명령어

```bash
bun run dev              # 개발 서버 (port 3000 고정 — 아래 CORS 주석 참고)
bun run build            # tsc --noEmit && vite build
bun run preview          # 정적 산출물 확인
bun run test             # vitest run
bun run generate-routes  # tsr generate (라우트 추가/삭제 시 routeTree.gen.ts 재생성)
bun run format           # oxfmt --write
bun run lint             # oxlint
```

## 구조

```
src/
  routes/            파일 기반 라우팅 (__root.tsx = 레이아웃 셸)
    index.tsx        원페이지: 화보 → RSVP (+ 넛지, 로그 드로어)
  components/        Header, BookIcon, PhotoStack, ScrollNudge,
                     LogDrawer, LogList, LogRow, LoadingHeart, RsvpForm
  lib/
    cms.ts           tyange-cms-api 연동 (getPosts / getPost)
    drawer.tsx       드로어 열림 상태 컨텍스트
    markdown.ts      marked 래퍼
    photos.ts        화보 목록 상수
    rsvp.ts          RSVP 검증 + 제출 (제출은 현재 stub)
  styles.css         디자인 토큰
  routeTree.gen.ts   자동 생성 — 직접 수정 금지
```

## 백엔드

`tyange-cms-api`(Rust + Poem)를 쓴다. 별도 서비스를 두지 않는다.

**이미 있는 것 (그대로 사용)**

- `GET /posts` — 목록
- `GET /post/:post_id` — 본문, 아코디언 펼칠 때 호출

**아직 없는 것**

- `POST /public/wedding/guests` — RSVP 제출

> **중요: `tyange-cms-api`에 라우트를 추가할 때는 반드시 사용자 컨펌을 먼저 받는다.**
> 승인 전까지 `lib/rsvp.ts`의 `submitRsvp`는 stub으로 둔다. 승인 후 그 함수 본문만
> fetch 호출로 교체하면 되고 호출부는 바뀌지 않는다.

### CORS

**dev 서버 포트를 3000으로 고정한 이유**: `tyange-cms-api`의 CORS 허용 목록에
`http://localhost:3000`이 이미 들어 있다. 포트를 바꾸면 브라우저에서 CMS 호출이 전부 막힌다.

배포 시에는 `tyange-cms-api`의 `src/main.rs` `Cors::new()` 체인에 서비스 도메인을
`allow_origin`으로 추가해야 하며, **cms-api 배포가 프론트 배포보다 먼저**여야 한다.

## 화면 구성

메인 페이지는 **화보(스크롤 스냅) → RSVP** 두 덩어리다.

첫 진입에는 `ScrollNudge`가 화보 위에 뜬다. **사진 슬라이드와 DOM상 완전히 분리된 `fixed`
레이어**이며(슬라이드 안에 두면 스크롤할 때 사진과 함께 밀려 올라간다), 떠 있는 동안
`html.nudge-open`으로 페이지 스크롤을 잠근다. 클릭·터치·휠 어느 것으로든 해제되는데,
그 입력은 **넛지 요소에 붙은 `passive: false` 리스너가 `preventDefault` + `stopPropagation`으로
전부 흡수**해 사진이 미동도 하지 않게 한다.

언마운트 조건이 까다롭다. 페이드가 끝나도 곧바로 사라지지 않고 **입력이 멎을 때까지 투명한
흡수막으로 남는다** — 트랙패드는 플릭 한 번에 관성으로 wheel을 1초 가까이 쏟아내는데, 페이드만
끝났다고 걷어내면 그 잔여분이 화보에 닿아 한 장이 더 넘어간다. 다만 정적 타이머만 두면 사용자가
계속 스크롤을 시도할 때마다 리셋되어 영영 사라지지 않는 **라이브락**에 빠지므로, 리셋되지 않는
최대 시한(`FADE_MS + MAX_ABSORB_MS`)을 함께 둔다. 잠금 해제는 애니메이션 콜백이 아니라
`isMounted` 상태에 직접 묶는다 — 콜백에 기대면 안 불릴 때 페이지가 영영 잠긴다.

로그 목록은 페이지 흐름에 없고,
헤더 오른쪽 버튼으로 여는 **사이드 드로어**(`LogDrawer`)에 담긴다. 열림 상태는
`lib/drawer.tsx`의 컨텍스트가 들고, `__root.tsx`가 Provider를 건다.

드로어 안에서 항목을 누르면 그 자리에서 본문이 펼쳐지고, **다른 항목을 누르면 앞의 것이
닫히고 새 항목이 열린다**(한 번에 하나만). ESC와 배경 클릭으로 닫히며, 열려 있는 동안
`html.drawer-open`으로 뒤쪽 스크롤을 잠근다.

펼침/접힘은 `.log-panel`의 `grid-template-rows: 0fr <-> 1fr` 트랜지션이다.
`height: auto`는 트랜지션이 걸리지 않아 이 방식을 쓴다. 애니메이션이 걸리려면 패널이 항상
마운트돼 있어야 하므로, **닫힌 상태를 조건부 렌더링(`{isOpen && ...}`)으로 되돌리지 말 것.**
대신 `inert`로 접근성 트리에서 뺀다.

본문을 받아오는 동안에는 `LoadingHeart`(픽셀 하트, 박동 애니메이션)를 행 안에 띄운다.

## 데이터 흐름

- **목록**: 라우트 `loader`에서 `getPosts()`. `isLovelogPost` 필터(카테고리 `general` +
  태그 `love`/`lovelog`)로 거른다. **이 필터를 제거하지 말 것** — 청첩장에 다른 블로그 글이
  새는 걸 막는 장치다.
- **본문**: 행을 처음 펼칠 때만 `getPost()` 호출. `LogRow.tsx`의 모듈 스코프 `bodyCache`가
  Promise를 캐시하므로 재펼침·StrictMode 이중 실행·연타에도 요청이 한 번만 나간다.
- 로딩/실패 상태는 **행 안에서** 표시한다. 전역 스피너를 쓰지 않는다.

## 폰트

- **본문 전체: Pretendard.** `index.html`에서 jsDelivr의 **dynamic subset** CSS를 불러온다.
  전체 가변 폰트는 2MB, npm 패키지는 93MB/1826파일이라 레포에 넣지 않았다. dynamic subset은
  92조각으로 나뉘어 `unicode-range`로 필요한 것만 받는다. `--font-sans`의 첫 후보는
  패밀리명 그대로 **`Pretendard Variable`**이어야 한다.
  CDN이 죽어도 시스템 폰트로 떨어질 뿐 사이트는 정상 동작한다.
- **워드마크(THE LOVELOG): Determination.** `public/fonts/determination/`에 자체 호스팅하며
  `--font-wordmark`(Tailwind `font-wordmark` 유틸)로 쓴다.
  **CC BY 3.0이고 재배포 시 원본 아카이브 파일 동반이 조건**이라 `license.txt`,
  `readme.txt`를 같은 폴더에 뒀다. **지우지 말 것.**
  단일 웨이트 픽셀 서체라 `font-bold` 류를 겹치면 합성 볼드로 뭉개진다.

## 컨벤션

- 라우트 파일을 추가/삭제하면 `bun run generate-routes` 실행.
  `routeTree.gen.ts`는 절대 손으로 수정하지 않는다.
- 색상은 하드코딩하지 말고 `styles.css`의 토큰(`--color-bg`, `--color-accent`, `--color-ink`)을
  쓴다. 디자인 확정 시 토큰만 갈아끼우기 위함이다.
- **모바일 전용 폭 고정**. `.frame`이 `--frame-max-width`(430px)로 전체를 묶고 가운데 정렬하며,
  프레임 밖은 `--color-shell`이다. 넓은 화면에서도 레이아웃이 늘어나지 않는다.
- **화보는 스크롤 진행도의 순수 함수다.** `PhotoStack`은 상태를 갖지 않는다.
  높이 `N × 한 화면`짜리 트랙 안에 `sticky` 뷰포트를 두고, 사진 N장을 같은 자리에
  `z-index` 역순으로 겹친다. 사진 i의 `y`는 `useScroll` 진행도를 `useTransform`으로
  매핑해 `0% → -105%`로 간다. 마지막 장은 빠지지 않고 그 자리에서 RSVP가 이어받는다.
  **인덱스 상태로 넘기는 방식으로 되돌리지 말 것** — 그러면 페이지 스크롤을 잠가야 하고,
  화보와 RSVP 경계마다 잠금·해제·복귀 예외가 끝없이 생긴다. 스크롤에만 의존하면
  트랙패드·터치·휠·키보드가 전부 그냥 동작하고 되돌아가기도 저절로 대칭이 된다.
- 사진은 **뷰포트 크기 그대로** 미끄러진다. 전환 중 `scale`을 넣지 않는다.
- 스냅 대상은 트랙 안에 한 화면 간격으로 깐 **보이지 않는 마커(`.photo-snap`)** 다.
  sticky 뷰포트는 하나뿐이라 그 자체로는 스냅 지점이 될 수 없다. 마커가 없으면 사진이
  반쯤 빠진 채로 멈춘다.
- **`html`에 `scroll-behavior: smooth`를 넣지 말 것.** 스냅과 부딪혀 스크롤이 끈적해진다.
  부드러운 이동이 필요한 곳은 `scrollIntoView({ behavior: 'smooth' })`로 호출부에서 지정한다.
- **다크 모드를 만들지 않는다.** 시안이 네이비 단일 테마이고, 사진 위 오버레이 대비가 깨진다.
- **주석을 달지 않는다.** 코드는 이름과 구조로 자명하게 쓴다. 다만 "왜 이렇게 했는지"가
  코드만으로 드러나지 않는 곳(캐시 전략, stub 경계)은 예외로 남긴다.
- 코드 수정 후 `bun run format`과 `bun run lint`를 통과시킨다. 타입은 `bun run build`가 겸한다.

## 다음 단계

1. 사진은 `public/photos/photo-1..8.jpg` (긴 변 1600px, 총 2.0MB). 이 머신의 `sips`가
   WebP를 못 써서 JPEG q80으로 변환했다. 더 줄이려면 `cwebp`가 필요하다.
2. RSVP 백엔드 라우트 (컨펌 후) + `lib/rsvp.ts` stub 교체
3. `tyange-cms`에 하객 명단 리스트 페이지
4. 배포 — nginx server block(**SPA fallback `try_files` 필요**), certbot, GitHub Actions
5. 익명 이미지 업로드, 경매 출품 폼

## 미확정

- 서비스 서브도메인
- 결혼식 날짜·장소·시간 (화보에 안내 문구를 아직 넣지 않았다)
- 커버 문구
- Motion은 화보 스크롤 연동에만 쓴다. 부담되면 IntersectionObserver로 대체 가능.
