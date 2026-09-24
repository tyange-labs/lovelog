# lovelog — 부부의 로그 타임라인

## 프로젝트 개요

`tyange-love`(SvelteKit 블로그)와 `bosskimwithu`(TanStack Start 청첩장)를 하나로 통합했던
프로젝트다. 2026-09-19 결혼전시회가 끝난 뒤, 사이트의 중심을 **부부의 로그(기록)**로
옮겼다. 화보·전시 안내·RSVP·Chapter 3(인생곡선/포토부스) 같은 청첩장 전용 기능은
걷어냈다 — 필요하면 git 태그 `wedding-invitation-2026`과 브랜치 히스토리에서 복원할 수 있다.

**현재 단계**: React → SolidJS 전면 재작성. 크림색 종이 조각을 붙여 나가는 스크랩북 타임라인 하나가
사이트의 전부다. `SHORT_FORM_SINCE`(2026-09-23) 이후에 쓰인 글은 200자 규칙이 적용되는
짧은 글로 표시한다. **실제 200자 입력 제한은 이 리포가 아니라 글을 쓰는 tyange-cms
쪽에서 강제한다** — lovelog는 표시만 담당하는 읽기 전용 소비자다.

## 기술 스택

- **SolidJS + `@solidjs/router`** — 파일 기반이 아니라 `App.tsx`에서 직접 라우트를 선언하는
  수동 라우팅. SSR 없는 **순수 정적 SPA**다. 빌드 산출물은 `dist/`
- **Vite 8**, **TypeScript**(`jsx: "preserve"`, `jsxImportSource: "solid-js"`), **bun**
- **Tailwind CSS 4** (`@tailwindcss/vite`, CSS-first `@theme`)
- **Vitest** + `@solidjs/testing-library`. vitest가 solid-js의 SSR 진입점을 잡지 않도록
  `vite.config.ts`의 `resolve.conditions: ['browser']`가 필요하다 — 빠지면 컴포넌트가
  jsdom에서 반응하지 않는다.
- lint/format: **oxlint**(react/solid 전용 플러그인 없이 import/typescript/unicorn만) / **oxfmt**
- import alias: `#/*` → `./src/*` (package.json `imports` 필드)

## 명령어

```bash
bun run dev       # 개발 서버 (port 3000 고정 — 아래 CORS 주석 참고)
bun run build     # tsc --noEmit && vite build
bun run preview   # 정적 산출물 확인
bun run test      # vitest run
bun run format    # oxfmt --write
bun run lint      # oxlint
```

## 구조

```
src/
  App.tsx            Router + RootLayout(Header + 프레임)
  main.tsx           엔트리 (solid-js/web render)
  routes/
    Timeline.tsx      메인 페이지: 스크랩북 타임라인
    PostPage.tsx      /p/:id — 글 하나 퍼머링크(공유용)
  components/
    Header.tsx        sticky 워드마크
    Entry.tsx          종이 조각 한 장 — 지연 로드 + 테이프 날짜 + 2줄 미리보기 + 더보기
    MonthHeader.tsx    월 스탬프
    LoadingHeart.tsx   픽셀 하트 로딩 인디케이터
  lib/
    cms.ts            tyange-cms-api 연동 (getPosts / getPostsCached / getPost / isLovelogPost)
    body.ts           글 본문 지연 로드 + 캐시 (loadBody / peekBody)
    navigation.ts     타임라인에서 글 페이지로 들어왔는지 기억 (돌아가기 링크용)
    timeline.ts        순수 함수: buildTimelineRows, isShortForm, plainLength
    markdown.ts        marked 래퍼
  styles.css          디자인 토큰 + 스크랩북 스타일
```

## 백엔드

`tyange-cms-api`(Rust + Poem)를 쓴다. 별도 서비스를 두지 않는다. lovelog는 이제 **읽기
전용**이다 — 쓰기 엔드포인트(RSVP 등)는 쓰지 않는다.

**쓰고 있는 라우트**

- `GET /posts/search-with-tags?exclude=archive` — 로그 목록. `include`/`exclude`는 태그를
  **하나씩만** 받고 카테고리를 가리지 않는다. `archive` 제외는 이 조건과 정확히 맞아
  서버에 맡기지만, love/lovelog + `general` 카테고리 조건은 표현할 수 없어
  `isLovelogPost`가 그대로 맡는다.
- `GET /post/:post_id` — 본문. 목록 API(`PostItem`)에는 `content`가 없어서 행이 뷰포트
  근처에 들어올 때(`Entry.tsx`의 `IntersectionObserver`) 개별 호출한다.

> **중요: `tyange-cms-api`를 고칠 때는 반드시 사용자 컨펌을 먼저 받는다.**

### CORS

**dev 서버 포트를 3000으로 고정한 이유**: `tyange-cms-api`의 CORS 허용 목록에
`http://localhost:3000`이 이미 들어 있다. 포트를 바꾸면 브라우저에서 CMS 호출이 전부 막힌다.

`https://lovelog.tyange.com`도 이미 허용 목록에 들어가 있다.

## 타임라인 UI — "스크랩북"

X(트위터) 타임라인을 그대로 따르지 않는다. 포스트모던 방향 세 가지(뉴웨이브 레일 / 진·스크랩북
/ 로그 파일)를 목업으로 비교해 **진·스크랩북**으로 정했다. 어두운 책상(`--color-paper`) 위에
글마다 크림색 종이 조각(`.scrap`, `--color-scrap`)을 붙이는 형태다.

- **종이 자세는 글 ID로 정한다.** `scrapPose(post_id)`가 기울기(±1.4°)와 좌우 어긋남(0~1)을
  돌려주고, `Entry`가 `--tilt`/`--shift` CSS 변수로 넘긴다. 목록 순번으로 정하면 새 글이 올라올
  때마다 아래 글 전부가 자세를 바꾸므로 순번 기반으로 바꾸지 말 것. 기울기를 ±1.4°보다 키우지
  말 것 — 종이 위 본문 가독성의 한계선이다.
- 날짜는 오렌지 테이프(`.scrap-tape`, `formatTape` → `8.4 화`)이고 누르면 글 페이지로 간다.
  요일은 한글 한 글자다. 테이프 서체는 Determination인데 한글이 없어 요일만 Pretendard로
  떨어진다(`font-synthesis: none`으로 Determination 합성 볼드를 막는다).
  월은 오렌지 테두리 스탬프(`.month-stamp`), sticky가 아니다.
- **글 사이·월 사이 여백은 날수와 상관없이 일정하다.** "N일 뒤" 같은 표시도, 날수에 비례해
  늘어나는 여백도 두지 않는다 — 둘 다 해봤고 102일 공백 같은 곳에서 화면이 텅 비어 뺐다.
- "더보기"는 글자 대신 이모지 하나(📖)다. 스크린리더용 `aria-label="더보기"`와 44px 터치 영역을
  유지할 것.
- 글 페이지(`/p/:id`)는 같은 종이를 기울이지 않고 폭 전체로 깐 `.scrap-sheet`다.
- 종이 위 링크 색은 오렌지가 아니라 `--color-bg`(네이비)다 — 크림색 위 오렌지는 대비가 부족하다.

- `buildTimelineRows`(`lib/timeline.ts`)가 `posts`(최신순) 하나로 월 구분·글 두 종류의
  행을 만든다. 월이 바뀌면 `month` 행을 끼워 넣는다. `Timeline.tsx`는 이 배열을 그대로 순회만 한다 — 그루핑 로직을 컴포넌트에 넣지 말 것.
- `Entry.tsx`는 `post_id`별로 `loadBody`를 한 번만 부른다(`lib/body.ts`의 모듈 스코프
  `bodyCache`, Promise를 캐시해 재요청·재마운트에도 요청이 한 번만 나간다). 실패하면
  캐시에서 지워 "다시 시도"가 재요청하게 한다.
- **짧은 글 판정은 두 조건을 다 봐야 한다**: `isShortForm`(작성일이 `SHORT_FORM_SINCE`
  이후)이면서 실제 본문도 `SHORT_FORM_LIMIT`(200자) 이내여야 `entry-compact`로 렌더링된다.
  기준일 이후 글이라도 길게 쓰였다면 레거시 글과 같은 미리보기+더보기로 처리한다 — 실제
  글자 수 제한이 없는 이 리포 쪽의 방어선이다. 글자 수는 `plainLength`가 마크다운 문법을
  걷어내고 센다(완벽한 파서는 아니다).
- **타임라인 안에서 펼치기/접기를 하지 않는다.** 긴 글은 `.entry-preview`의
  `line-clamp: 2`로 말줄임표까지만 보여주고, "더보기"를 누르면 `/p/:id` 글 페이지로 이동한다.
  예전엔 제자리에서 펼치고 접었지만, 접을 때 미리보기 높이로 돌아가며 화면이 튕기는 문제가
  남아 라우트 이동으로 바꿨다 — 제자리 펼침으로 되돌리지 말 것.
  "더보기"는 줄 수 추정이 아니라 실제로 잘렸을 때만 뜬다(`ResizeObserver`로
  `scrollHeight > clientHeight` 확인). 미리보기 안의 이미지는 `max-height: 12rem`으로 누른다.
- **글 페이지에서 돌아오면 보던 자리로 돌아와야 한다.** `<Router scrollRestoration>`이
  스크롤 이벤트로 위치를 기록했다가 뒤로 가기 때 한 번 복원한다. 복원 시점에 문서가 이미
  원래 높이여야 하므로, 목록은 `getPostsCached`가 두 번째부터 **동기로** 돌려주고(리소스가
  로딩을 거치지 않음), 본문은 `peekBody`로 이미 받은 것을 **동기로** 꺼내 행을 처음부터 채운다.
  둘 중 하나라도 비동기로 되돌리면 복원 시점에 문서가 짧아 위치가 잘린다.
  글 페이지의 "← 타임라인으로"는 타임라인에서 들어온 경우(`navigation.ts`)에만
  `history.back()`으로 동작해 같은 복원을 탄다. 공유 링크로 바로 들어온 경우엔 그냥 `/`로 간다.
- D+N(디데이) 표시는 넣지 않는다 —
  결혼 전시 카운트다운의 흔적이라 로그 자체와는 관계가 없다는 판단으로 뺐다.
- **제목은 위에 내세우지 않는다.** 레거시 글이든 짧은 글이든 똑같이, 제목은(있으면, 빈
  문자열이 아니면) 본문 뒤에 `entry-caption`("— 제목")으로 조용히 붙는다. 캡션은
  `.entry-preview` **안**, 본문 맨 끝에 있어서 긴 글은 타임라인에선 잘려 안 보이고
  글 페이지에서만 보인다. 글 페이지도 헤딩 없이 본문 끝에 같은 캡션을 둔다. 짧은 글(기준일
  이후)은 제목이 아예 없는 트위터식 글일 수 있어서 생긴 규칙인데, 기존 레거시 글에도
  똑같이 적용해 포맷을 통일했다 — 예전엔 레거시 글만 `entry-title`로 맨 위에 헤딩을
  냈지만 지금은 안 쓴다.

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
  테이프 날짜와 월 스탬프에도 쓴다.

## 컨벤션

- 색상은 하드코딩하지 말고 `styles.css`의 토큰(`--color-bg`, `--color-accent`, `--color-ink`,
  `--color-scrap*`)을
  쓴다. 디자인 확정 시 토큰만 갈아끼우기 위함이다.
- 읽기 폭은 `.frame`이 `--frame-max-width`(640px)로 묶고 가운데 정렬하며, 프레임 밖은
  `--color-shell`이다. 청첩장 시절의 430px 모바일 전용 고정폭은 아니다 — 타임라인은
  데스크톱에서도 그대로 읽을 수 있어야 한다.
- **다크 모드를 만들지 않는다.** 네이비 단일 테마를 유지한다.
- **주석을 달지 않는다.** 코드는 이름과 구조로 자명하게 쓴다. 다만 "왜 이렇게 했는지"가
  코드만으로 드러나지 않는 곳(캐시 전략, 기준일 상수)은 예외로 남긴다.
- 코드 수정 후 `bun run format`과 `bun run lint`를 통과시킨다. 타입은 `bun run build`가 겸한다.

## 다음 단계

1. **tyange-cms 에디터에 200자 입력 제한 추가** — lovelog 태그가 붙고 작성일이
   `SHORT_FORM_SINCE`(현재 2026-09-23) 이후인 글에 한해 강제. 별도 작업.
2. `og.jpg`가 아직 결혼전시회 시절 이미지다. 타임라인에 맞는 썸네일로 교체할지 판단.
3. 커버 문구/소개 없이 바로 타임라인으로 들어가는 게 맞는지, 짧은 도입부가 필요한지 미확정.

## 배포

`https://lovelog.tyange.com`. `main` 푸시가 곧 배포다 —
`.github/workflows/deploy.yml`이 lint → test → build → SCP → nginx 리로드까지 돌린다.
**즉 push가 곧 운영 반영이다.**
