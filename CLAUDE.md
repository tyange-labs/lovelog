# lovelog — 부부의 로그 타임라인

## 프로젝트 개요

`tyange-love`(SvelteKit 블로그)와 `bosskimwithu`(TanStack Start 청첩장)를 하나로 통합했던
프로젝트다. 2026-09-19 결혼전시회가 끝난 뒤, 사이트의 중심을 **부부의 로그(기록)**로
옮겼다. 화보·전시 안내·RSVP·Chapter 3(인생곡선/포토부스) 같은 청첩장 전용 기능은
걷어냈다 — 필요하면 git 태그 `wedding-invitation-2026`과 브랜치 히스토리에서 복원할 수 있다.

**현재 단계**: 스켈레톤 디자인. 브라우저 기본 스타일에 색 토큰과 Pretendard만 얹은 타임라인 하나가
사이트의 전부다(2026-11-27, 스크랩북 디자인에서 교체). `SHORT_FORM_SINCE`(2026-09-23) 이후에 쓰인 글은 200자 규칙이 적용되는
짧은 글로 표시한다. **실제 200자 입력 제한은 이 리포가 아니라 글을 쓰는 tyange-cms
쪽에서 강제한다** — lovelog는 표시만 담당하는 읽기 전용 소비자다.

## 기술 스택

- **SolidJS + `@solidjs/router`** — 파일 기반이 아니라 `App.tsx`에서 직접 라우트를 선언하는
  수동 라우팅. SSR 없는 **순수 정적 SPA**다. 빌드 산출물은 `dist/`
- **Vite 8**, **TypeScript**(`jsx: "preserve"`, `jsxImportSource: "solid-js"`), **bun**
- **CSS 프레임워크 없음.** `src/styles.css` 하나가 전부다. Tailwind는 preflight가 브라우저 기본
  스타일(제목·문단 여백, 버튼 모양)을 지워서 뺐다. 다시 넣지 말 것.
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
  App.tsx            Router + RootLayout(.page 안에 Header + main)
  main.tsx           엔트리 (solid-js/web render)
  routes/
    Timeline.tsx      메인 페이지: 타임라인
    PostPage.tsx      /p/:id — 글 하나 퍼머링크(공유용)
  components/
    Header.tsx        남색 띠 — LOVELOG 링크 + 밝게/어둡게 전환 버튼
    Entry.tsx          글 하나 — 굵은 날짜 + (제목 링크 | 지연 로드한 본문 미리보기) + ↗
    MonthHeader.tsx    월 <h2>
    Loading.tsx        "불러오는 중…" 글자
    PostActions.tsx    글 페이지 아래 공유 버튼 셋 — 글 링크 / 타임라인 위치 / 이미지로
    ImageSheet.tsx     "이미지로" <dialog> — ShareCard를 PNG로 찍어 미리보기 + 저장·공유
    ShareCard.tsx      PNG로 찍는 카드(어두운 바탕, 540px × 2배 = 1080px, 기본 4:5)
  lib/
    cms.ts            tyange-cms-api 연동 (getPosts / getPostsCached / getPost / isLovelogPost)
    body.ts           글 본문 지연 로드 + 캐시 (loadBody / peekBody)
    navigation.ts     타임라인에서 글 페이지로 들어왔는지 기억 (돌아가기 링크용)
    deeplink.ts       공유 링크(/?at=<id>) 만들기 + 도착 시 그 글로 이동·고정
    share.ts          링크·PNG 공유(공유 시트 → 없으면 복사/내려받기)
    font-subset.ts    PNG에 박아 넣을 웹폰트 조각 고르기(unicode-range) + data URL 변환
    theme.ts          밝게/어둡게 테마 읽기·저장 (localStorage `lovelog-theme`)
    timeline.ts        순수 함수: buildTimelineRows, isShortForm, postTime, plainLength
    markdown.ts        marked 래퍼
  styles.css          색 토큰 + 테마 + 동작에 꼭 필요한 최소 스타일
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

## 타임라인 UI — "스켈레톤"

목업 9개(맨 HTML / 문서형 / headless / 표 / 색인 / 와이어프레임 / 한 줄 로그 / 기본 위젯 / 크림 종이)를
비교해 **"거의 맨 HTML"**로 정했다(2026-11-27). 브라우저 기본 스타일(h2·p·hr·button 기본 모양,
body 8px 여백)을 그대로 쓰고, 색 토큰·Pretendard·남색 머리띠만 얹는다. 레이아웃·카드·그림자·
기울기 같은 장식을 다시 들이지 말 것. 폭은 헤더까지 감싼 `.page`의 `max-width: 65ch`(Tailwind `max-w-prose`와 같은 값) + 가운데 정렬뿐이다.

- 날짜는 `<b>`(`formatTape` → `8.4 화`)이고 **링크가 아니다**(사용자 요청). 월은 `<h2>`.
- **글 사이·월 사이 여백은 날수와 상관없이 일정하다.** "N일 뒤" 같은 표시도, 날수에 비례해
  늘어나는 여백도 두지 않는다 — 둘 다 해봤고 102일 공백 같은 곳에서 화면이 텅 비어 뺐다.
- 잘린 긴 글에는 글자 `↗`가 붙는다(장식, `aria-hidden`). 아이콘 라이브러리는 쓰지 않는다.
- 글 페이지(`/p/:id`)는 맨 위 `← 타임라인` 링크 + `<hr>` + 날짜 + 본문 + `— 제목` + `<hr>` + 공유 버튼.

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
  `scrollHeight > clientHeight` 확인). 미리보기 안의 이미지는 `max-height: 40rem`으로 누른다 — 손글씨 사진(글씨가 읽혀야 함)이 작게 줄지 않도록 12rem에서 키웠다.
- **글 페이지에서 돌아오면 보던 자리로 돌아와야 한다.** `<Router scrollRestoration>`이
  스크롤 이벤트로 위치를 기록했다가 뒤로 가기 때 한 번 복원한다. 복원 시점에 문서가 이미
  원래 높이여야 하므로, 목록은 `getPostsCached`가 두 번째부터 **동기로** 돌려주고(리소스가
  로딩을 거치지 않음), 본문은 `peekBody`로 이미 받은 것을 **동기로** 꺼내 행을 처음부터 채운다.
  둘 중 하나라도 비동기로 되돌리면 복원 시점에 문서가 짧아 위치가 잘린다.
  글 페이지 맨 위 `← 타임라인` 링크는 타임라인에서 들어온 경우(`navigation.ts`)에만
  `history.back()`으로 동작해 같은 복원을 탄다. 공유 링크로 바로 들어온 경우엔 그냥 `/`로 간다.
- **짧은 글은 날짜에 시각을 붙인다**(`9.24 목 21:30`, 글 페이지는 `2026.09.24 목 21:30`).
  하루에 여러 개 올라갈 수 있어서다. `published_at`은 날짜뿐이라 cms-api의 `created_at`(글을
  처음 저장한 UTC 시각, ISO `…Z`)을 한국 시각으로 옮겨 쓴다(`postTime`). 옛 글의 `created_at`은
  이관 시각이라 무의미하고, 날짜를 따로 고쳐 올린 글은 시각이 어긋나므로 **짧은 글이면서 한국
  날짜가 `published_at`과 같을 때만** 붙인다. 같은 날 글의 순서는 cms-api가 이미
  `published_at DESC, created_at DESC`로 맞춰 준다.
- **공유는 전부 글 페이지에서 한다 — 타임라인에는 공유 UI를 두지 않는다.** 본문 아래
  `PostActions`의 브라우저 기본 버튼 셋: **글 링크**(`/p/:id`), **타임라인 위치**(`/?at=<id>`),
  **이미지로**(PNG). 링크는 공유 시트가 있으면 공유 시트, 없으면 클립보드
  복사 후 버튼 이름이 잠깐 "복사했어요"로 바뀐다.
- **PNG(이미지로)**: `<dialog>`(`ImageSheet`)가 열리면 화면 밖(`.share-card-stage`)에
  `ShareCard`를 그려 `modern-screenshot`으로 찍는다(라이브러리는 이때 동적 import). 카드는 화면
  테마와 상관없이 늘 어두운 바탕(`--color-paper`)에 날짜·본문·`— 제목`, 아래 `LOVELOG · 주소`. 540px 폭을 2배로 찍어 1080px, 높이는 4:5(1350px)가 기본이고 긴 글이면 늘어난다.
  "저장·공유"는 파일 공유가 되는 곳(iOS·Android)에선 공유 시트(사진에 저장/바로 보내기), 아니면
  내려받기. 찍을 때 함정 셋:
  1. **웹폰트 스타일시트에 `crossorigin="anonymous"`가 있어야 한다**(`index.html`). 없으면
     교차 출처 시트의 규칙을 못 읽어 대체 글꼴로 찍힌다.
  2. 라이브러리 기본 폰트 임베드는 `unicode-range`를 안 보고 **쓰인 패밀리의 조각 전부**(Pretendard
     92개)를 받는다. 그래서 `font-subset.ts`가 카드 글자를 덮는 조각만 골라
     직접 받아 data URL로 박은 CSS를 `font.cssText`로 넘긴다. cssText는 **그대로 쓰일 뿐 받아
     주지 않으므로** 바깥 url()로 넘기면 글꼴이 빠진다(찍은 결과는 SVG 이미지라 외부 파일을 못 읽음).
  3. 본문 사진은 글 페이지가 이미 CORS 없이 받아 캐시해 둔 상태라, 그 캐시를 다시 쓰면 CORS에
     막혀 빈 칸으로 찍힌다. `inlineImages`가 `cache: 'no-store'` + CORS로 직접 받아 data URL로
     바꿔 끼운다. (`img.decode()`는 쓰지 말 것 — 프레임이 안 그려지는 탭에선 끝나지 않는다.)
- **타임라인 위치 링크 `/?at=<post_id>`로 들어오면** `Timeline`이 그 글
  (`id="post-<id>"`)을 화면 가운데로 옮기고 `is-target`(오렌지 외곽선)을 붙인다. 위쪽 글 본문이 늦게 들어와 문서가 길어지므로 `holdInView`가 4초 동안(또는 사용자가
  스크롤을 시작할 때까지) `ResizeObserver`로 자리를 다시 맞춘다 — iOS Safari에 scroll
  anchoring(`overflow-anchor`)이 없어서 직접 한다. 이동은 **방문당 한 번**(`claimTarget`)이다.
  링크로 들어와 글을 보고 뒤로 오면 `?at=`이 URL에 남아 있어도 다시 끌어오지 않고 스크롤 복원에
  맡긴다. `/p/:id` 퍼머링크는 그대로 살아 있다.
- D+N(디데이) 표시는 넣지 않는다 —
  결혼 전시 카운트다운의 흔적이라 로그 자체와는 관계가 없다는 판단으로 뺐다.
- **제목이 있는 글은 타임라인에서 제목만 보여준다.** 날짜 + 제목 링크 한 줄이고,
  본문은 받아오지도 않는다(`IntersectionObserver`도 걸지 않음). 제목이 없는 글(트위터식 짧은
  글)만 본문을 받아 미리보기(짧으면 전체, 길면 2줄)로 보여주고, **본문 전체가 글 페이지 링크**
  (`.entry-body-link`)다. 링크 안에 링크를 둘 수 없어서 미리보기는 `renderPreviewMarkdown`으로 본문
  속 링크를 글자만 남겨 그린다(원래 링크는 글 페이지에서 산다). 글 페이지는 헤딩 없이
  본문 끝에 "— 제목"을 둔다.
  (이력: 한때 제목을 전부 본문 뒤 캡션으로만 돌렸다가, 타임라인에선 제목이 있는 글이면 제목이
  미리보기 역할을 하는 쪽이 낫다고 판단해 바꿨다.)

## 사이트 이름·파비콘

- 이름은 어디서나 **`LOVELOG`**다("THE" 없음 — 사용자 요청): 사이트 제목, 메타 태그, 헤더,
  PNG 카드, `og.jpg`. 메타 설명은 짧게 둔다 — `description`/`og:description`은 `연결.`,
  `og:image:alt`는 `LOVELOG`. 긴 설명 문구를 덧붙이지 말 것.
- 파비콘은 예전 로딩 하트(픽셀 원 + 하트 구멍)를 남색 바탕에 얹은 것:
  `public/favicon.svg`(원본), `favicon-32.png`, `apple-touch-icon.png`(180, 모서리 없이 꽉 채움 —
  iOS가 알아서 둥글린다). PNG는 SVG를 Playwright로 찍어 만들었다.

## 폰트

- **Pretendard 하나만 쓴다**(본문·UI·PNG 카드 모두). `index.html`에서 jsDelivr의 **dynamic subset**
  CSS를 불러온다. 전체 가변 폰트는 2MB, npm 패키지는 93MB/1826파일이라 레포에 넣지 않았다.
  dynamic subset은 92조각으로 나뉘어 `unicode-range`로 필요한 것만 받는다. `--font-sans`의 첫
  후보는 패밀리명 그대로 **`Pretendard Variable`**이어야 한다. CDN이 죽어도 시스템 폰트로 떨어질
  뿐 사이트는 정상 동작한다.
- 예전 본문 서체 Noto Serif KR과 워드마크 서체 Determination은 스켈레톤 디자인에서 뺐다.
  `public/fonts/determination/`은 지금 쓰지 않지만, CC BY 3.0 조건(재배포 시 원본 아카이브 파일
  동반)대로 `license.txt`, `readme.txt`와 함께 남아 있다. 폴더를 지울 땐 셋을 같이 지운다.

## 컨벤션

- 색상은 하드코딩하지 말고 `styles.css`의 토큰을 쓴다. 브랜드 색(`--color-bg` 남색,
  `--color-accent` 오렌지, `--color-paper`/`--color-ink*`, `--color-scrap*`)은 그대로 두고,
  화면은 테마에 따라 바뀌는 `--page-bg`/`--page-ink`/`--page-muted`/`--page-link`를 쓴다.
- **밝게/어둡게 테마**: 기본은 시스템 설정(`prefers-color-scheme`)을 따르고, 헤더 버튼으로 고르면
  `<html data-theme>`과 localStorage(`lovelog-theme`)에 남는다. `index.html`의 인라인 스크립트가
  첫 화면 전에 저장값을 적용해 깜빡임을 막는다. 어둡게는 `--color-paper` 바탕 + 크림 글씨 +
  오렌지 링크, 밝게는 크림(`--color-scrap`) 바탕 + 검은 글씨 + **남색 링크**(크림 위 오렌지는
  대비가 모자람). 남색 머리띠(`--color-bg`) 위 주황 `LOVELOG`와 주황 월 제목(`h2`)은 두 테마
  공통이다 — 밝게 테마에서 주황이 사라지지 않게 하는 자리다.
- **주석을 달지 않는다.** 코드는 이름과 구조로 자명하게 쓴다. 다만 "왜 이렇게 했는지"가
  코드만으로 드러나지 않는 곳(캐시 전략, 기준일 상수)은 예외로 남긴다.
- 코드 수정 후 `bun run format`과 `bun run lint`를 통과시킨다. 타입은 `bun run build`가 겸한다.

## 다음 단계

1. (완료 기록) 글 페이지 공유 버튼 셋 + PNG 추출은 2026-09-24에 들어갔다.
   (tyange-cms 에디터의 200자 제한은 2026-09-24에 들어갔다. 기준일·글자 수·태그 조건은
   tyange-cms `app/utils/short-form.ts`에도 같은 값이 있으니 **함께 고친다.**)
2. (완료 기록) `og.jpg`를 타임라인 스타일(1200×630, 왼쪽 워드마크 + 오른쪽 종이 조각 셋)로
   바꿨다(2026-09-24, 워드마크는 `LOVELOG` 한 줄). HTML로 그려 Playwright로 찍은 JPEG다. 다시 바꿀 땐 `index.html`의
   `og:image` 쿼리(지금 `?v=3`)도 올려야 카카오톡 등이 옛 캐시를 버린다. SPA라 글마다 다른 OG 카드는
   SSR/프리렌더 없이는 못 만든다.
3. 커버 문구/소개 없이 바로 타임라인으로 들어가는 게 맞는지, 짧은 도입부가 필요한지 미확정.

## 배포

`https://lovelog.tyange.com`. `main` 푸시가 곧 배포다 —
**GitHub Actions**의 `.github/workflows/deploy.yml`이 lint → test → build →
SCP → nginx 리로드까지 돌린다. **즉 push가 곧 운영 반영이다.**

- 러너는 GitHub 호스팅 `ubuntu-latest`, environment는 `deploy on aws`. Lightsail에 SSH로 올린다.
- secrets: `HOST`, `USERNAME`, `SSH_PRIVATE_KEY` / vars: `DEPLOY_PATH`(필수),
  `VITE_CMS_API_BASE`(선택).
- (2026-11) Forgejo(`git.tyange.com`)와 `.forgejo/workflows`는 없앴다.
- SCP 단계가 SSH 인증 실패처럼 보여도 `vars.DEPLOY_PATH` 미등록일 수 있다 — 로그에
  "remote server os type is unix"가 찍혔는지부터 볼 것.
