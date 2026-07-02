# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React 19 + TypeScript + Vite notes app used as a learning/practice project (실습 프로젝트). It is a simple CRUD note-taking UI backed by `json-server` as a fake REST API.

## Commands

```bash
npm run dev        # runs Vite dev server AND json-server concurrently (app :5173, API :3001)
npm run server      # run only json-server against db.json (:3001)
npm run build       # tsc typecheck + vite build
npm run preview     # preview production build
npm run lint         # eslint . --fix
npm run format        # prettier --write .
npm test              # vitest run (single run)
npm run test:watch     # vitest watch mode
```

There are currently no test files in the repo; `test-setup.ts` (imports `@testing-library/jest-dom`) and Vitest/Testing Library deps are wired up in `vite.config.ts` (`environment: 'jsdom'`) but unused. To run a single test file once tests exist: `npx vitest run path/to/file.test.tsx`.

The app requires the API server running for data to load — `npm run dev` starts both; running only `vite` will leave note fetches failing.

## Architecture

- **Data flow**: `src/api/notes.ts` — thin fetch wrappers (`fetchNotes`, `createNote`, `updateNote`, `deleteNote`) hitting `http://localhost:3001` (json-server, backed by `db.json`). No env-based URL config; the base URL is hardcoded.
- **State**: `src/context/NotesContext.tsx` — single React Context (`NotesProvider`/`useNotes`) is the sole source of truth for notes state (`notes`, `loading`, `error`) and mutation actions (`createNote`, `updateNote`, `deleteNote`). It fetches notes once on mount and does optimistic local array updates after each API call (no refetch-after-write). Components must consume state via `useNotes()`, not by calling `src/api/notes.ts` directly.
- **Selection/editing state** (`selectedNoteId`, `isCreating`) lives in `App.tsx`, not in context — it's UI-local, not data.
- **Component tree**: `App` → `NotesProvider` → `Layout` (header + sidebar/main slots passed as props, not children composition) → `NoteList` (reads `useNotes()`, renders `NoteItem`s) and `NoteEditor` (reads/writes `useNotes()`, form for create/edit).
- **Types**: `src/types/note.ts` defines the single `Note` interface used throughout, including an optional `tags?: string[]` field (rendered via `NoteTagBadge`).

## 구현 패턴 (코드에서 발견된 규칙)

### 컴포넌트 패턴

- 모든 컴포넌트는 `export function ComponentName(...)` 형태의 named export만 사용한다 (default export, arrow-function 컴포넌트 없음).
- Props는 함수 시그니처에서 바로 구조 분해하고, 타입은 컴포넌트 바로 위에 `interface ComponentNameProps { ... }`로 선언한다 (예: `NoteListProps`, `NoteEditorProps`).
- 로딩/에러/빈 상태처럼 화면이 여러 상태를 가질 때는 컴포넌트 최상단에서 조건별 `early return`으로 분기한다 (`NoteList`의 loading → error → empty → 목록 순서, `NoteEditor`의 미선택 상태 처리).
- 부모-자식 레이아웃 조합은 `children`이 아니라 `sidebar`/`main` 같은 명시적 ReactNode props로 슬롯을 주입한다 (`Layout` 참고). 새 레이아웃 슬롯을 추가할 때도 이 방식을 따른다.
- JSX 내 주요 영역은 한국어 주석으로 구분한다 (`{/* 헤더 */}`, `{/* 사이드바 */}`, `{/* 버튼 영역 */}` 등). 새 섹션을 추가할 때도 이 스타일을 유지한다.
- 조건부 클래스는 템플릿 리터럴 + 삼항 연산자로 처리한다 (`NoteItem`의 `isSelected` 분기 참고). 별도의 classnames 유틸은 사용하지 않는다.
- 리스트 아이템 내부에 있는 개별 액션 버튼(삭제 등)은 `onClick`에서 `e.stopPropagation()`으로 상위 클릭 핸들러(선택 등)와의 충돌을 명시적으로 막는다.
- 에러/검증 실패는 `alert()`를 쓰지 않고 `console.error()`로만 처리한다. 사용자에게 막아야 하는 입력(예: 제목 미입력)이나 API 실패(catch 블록)나 동일하게 `console.error`만 호출하고 별도 팝업을 띄우지 않는다.

### 상태 관리 방식

- 서버에서 온 전역 데이터(notes 목록)는 React Context(`NotesContext`)로만 관리하고, 화면 전환/폼 입력 같은 로컬 UI 상태(`selectedNoteId`, `isCreating`, `title`, `content`, `saving`)는 해당 컴포넌트의 `useState`로만 관리한다. 이 둘을 섞지 않는다 (예: 선택 상태를 Context에 넣지 않음).
- Context는 상태와 액션 함수를 함께 노출한다 (`{ notes, loading, error, createNote, updateNote, deleteNote }`). 상태만 있고 액션은 별도 훅으로 분리하는 패턴은 쓰지 않는다.
- Context 접근은 반드시 커스텀 훅(`useNotes()`)을 통해서만 하고, 이 훅은 Provider 밖에서 호출되면 에러를 던진다. 새로운 전역 상태를 추가할 때도 `create Context + Provider + use구독훅` 3종 세트 패턴을 따른다.
- 데이터 변경 후에는 서버를 다시 fetch하지 않고, 응답으로 받은 결과로 로컬 배열 상태를 직접 갱신하는 낙관적 업데이트 방식을 쓴다 (`setNotes((prev) => ...)`).
- 최초 데이터 로드는 `useEffect(() => {...}, [])`로 마운트 시 1회만 수행한다. props 변화에 폼 상태를 동기화할 때도 `useEffect`를 쓰되, 의도적으로 의존성을 제한하는 경우 `eslint-disable-line react-hooks/exhaustive-deps` 주석으로 명시한다 (`NoteEditor` 참고).

### API 호출 패턴

- 모든 fetch 호출은 `src/api/notes.ts` 한 곳에 모아두고, 컴포넌트나 Context 밖에서 `fetch`를 직접 호출하지 않는다.
- 각 API 함수는 `fetch → res.ok 체크 → 실패 시 Error throw → res.json() 반환` 순서를 그대로 반복하는 형태를 따른다. 새 API 함수를 추가할 때도 이 구조를 그대로 복제한다.
- `createdAt`/`updatedAt` 타임스탬프는 호출하는 쪽(Context)이 아니라 API 함수 내부(`new Date().toISOString()`)에서 채운다.
- 컴포넌트는 `src/api/notes.ts`를 직접 import하지 않고 반드시 `useNotes()`가 제공하는 액션을 통해서만 데이터를 변경한다.

### 네이밍 패턴

- API 계층(`src/api/notes.ts`)과 Context 계층(`NotesContext.tsx`)의 CRUD 함수명은 동일한 동사로 통일한다: 조회는 `fetchNotes`, 생성/수정/삭제는 계층에 관계없이 `createNote`/`updateNote`/`deleteNote`를 그대로 쓴다 (예전에는 Context에서 `add/edit/remove`를 썼지만 통일했다 — 새 액션을 추가할 때도 API 계층 동사를 그대로 재사용한다).
- 컴포넌트 내부에서 정의하는 이벤트 핸들러는 `handleXxx` (예: `handleSelectNote`, `handleSave`), 컴포넌트가 받는 콜백 props는 `onXxx` (예: `onSelect`, `onDelete`, `onDone`)로 구분한다.
- boolean 상태/props는 `is` 접두사를 쓴다 (`isCreating`, `isSelected`).
- Props 타입 인터페이스는 항상 `컴포넌트명 + Props` (예: `LayoutProps`, `NoteItemProps`).

## Conventions

- Styling is Tailwind v4 utility classes (via `@tailwindcss/vite`), no CSS modules/styled-components. Custom theme tokens (`bg-card`, `text-foreground`, `border-border`, `text-muted-foreground`, `text-destructive`, etc.) are used — check `src/index.css` for the theme definitions before introducing new colors.
- UI copy/strings are in Korean; keep new UI text consistent with that.
- Prettier: single quotes, semicolons, trailing commas, 100-char print width (`.prettierrc`) — run `npm run format` rather than hand-formatting.
- ESLint flat config (`eslint.config.js`) extends `typescript-eslint` recommended + `react-hooks` + `react-refresh`; `noUnusedLocals`/`noUnusedParameters` are enforced by `tsconfig.json`.
- No `.env` — API base URL is hardcoded in `src/api/notes.ts`.
