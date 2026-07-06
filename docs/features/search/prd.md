# 검색 기능 PRD

`spec-original.md`(원본 요구사항)와 `spec-fixed.md`(질문/답변으로 확정한 설계 결정)를 기반으로 한 PRD다. 세부 UI/데이터 결정의 근거는 `spec-fixed.md`를 참고한다.

## 1. 개요

노트의 제목과 본문을 대상으로 사이드바에서 실시간으로 검색·필터링할 수 있게 한다. 목적은 노트가 많아졌을 때 원하는 노트를 빠르게 찾을 수 있게 하는 것이다 (`spec-original.md` 기준).

## 2. 사용자 스토리

| #   | 스토리                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 사용자로서, 사이드바 검색창에 단어를 입력하면 제목이나 본문에 그 단어가 포함된 노트만 즉시 보고 싶다. 그래야 노트가 많아도 빠르게 찾을 수 있다. |
| 2   | 사용자로서, 검색 결과 목록에서 어느 부분이 검색어와 일치했는지 하이라이트로 바로 확인하고 싶다. 그래야 왜 이 노트가 검색됐는지 알 수 있다.      |
| 3   | 사용자로서, 검색창의 x 버튼 한 번으로 검색어를 지우고 전체 목록으로 돌아가고 싶다.                                                              |
| 4   | 사용자로서, 노트를 편집하던 중 검색을 하더라도 편집 중이던 노트가 갑자기 닫히지 않았으면 한다.                                                  |
| 5   | 사용자로서, 검색했는데 일치하는 노트가 없으면 "노트가 아예 없는 것"과 구분되는 안내를 보고 싶다.                                                |

## 3. 기술 결정 (ADR)

> `Context` / `Decision` / `Alternatives` / `Consequences` 형식을 따른다. 아키텍처 3안 비교에서 사용자가 선택한 B안(`useNoteSearch` 훅 + `SearchInput` 컴포넌트)을 기반으로 작성한다.

### ADR-001: 검색 상태 및 필터링 로직의 위치

- **Context**: 검색어(query)는 서버에서 온 데이터가 아니라 "지금 무엇을 보여줄지"를 결정하는 UI 로컬 상태다. 이 프로젝트는 "전역 데이터는 Context, 로컬 UI 상태는 컴포넌트 `useState`"라는 원칙(`CLAUDE.md`)을 지켜왔고, 태그 기능에서 같은 문제(로컬 state + 로직을 어디에 둘지)를 `useTags` 훅 + `TagInputField` 컴포넌트 분리로 해결한 전례(ADR-004)가 있다.
- **Decision**: `src/hooks/useNoteSearch.ts` 커스텀 훅을 만든다. 훅은 `notes: Note[]`를 인자로 받아 `{ query, setQuery, filteredNotes }`를 반환하며, 내부에서 `useMemo`로 trim + 대소문자 무시 + 부분 문자열 매칭(`spec-fixed.md` 결정 #5)을 수행해 `filteredNotes`를 계산한다. trim한 query가 빈 문자열이면 매칭을 생략하고 `filteredNotes`는 `notes`를 그대로 반환한다(빈 쿼리 처리는 ADR-002에서 상세히 다룬다). 검색창 UI는 `src/components/SearchInput.tsx` 프레젠테이션 컴포넌트로 분리하고, `<input aria-label="노트 검색" .../>`로 접근성 규칙(`spec-fixed.md` 결정 #11)을 지킨다(값과 x 버튼 클릭 콜백만 props로 받음). `NoteList`는 `useNoteSearch(notes)`를 호출해 `SearchInput`에 값을 넘기고 `filteredNotes`로 `NoteItem`을 렌더링하는 합성만 담당한다. `NoteList`의 기존 loading → error → empty(`notes.length === 0`) → 목록 early-return 순서는 그대로 두고, `SearchInput`은 **마지막 "목록" 분기 안에서만** 렌더링한다(`spec-fixed.md` 결정 #12) — 즉 로딩/에러/전체-empty 상태에서는 검색창이 보이지 않는다. `NotesContext`는 변경하지 않는다.
- **Alternatives**:
  - A안(`NoteList`에 인라인 구현) — 기각. 파일 수는 가장 적지만 `NoteList`가 이미 담당하는 loading/error/empty 분기 + 목록 렌더링에 검색 UI와 매칭 로직까지 더해져 책임이 계속 늘어나고, 검색 로직만 따로 단위 테스트할 방법이 없다.
  - C안(`NotesContext`에 `searchQuery`/`filteredNotes` 추가) — 기각. 검색어는 서버 데이터가 아닌데 전역 데이터 Context에 섞이면 이 프로젝트가 명시적으로 지켜온 "데이터 vs UI 로컬 상태 분리" 원칙을 깨고, 이후 다른 전역 상태를 추가할 때도 이 경계가 흐려지는 선례가 된다.
- **Consequences**: (+) 방금 검증된 `useTags`+`TagInputField` 패턴과 동일한 구조라 코드베이스 전반의 일관성이 강화된다. (+) `useNoteSearch`를 `renderHook`으로, `SearchInput`을 props만으로 독립 테스트할 수 있어 `NoteList` 통합 테스트 범위가 좁아진다. (–) 작은 기능 대비 파일이 늘어난다(`NoteList.tsx` 1개 → `useNoteSearch.ts` + `SearchInput.tsx` + `NoteList.tsx` 3개). (–) `filteredNotes`는 매 렌더링마다 `notes`/`query` 참조 비교에 의존하는 `useMemo`이므로, 이후 `notes` 배열을 불필요하게 새 배열로 재생성하는 코드가 추가되면 메모이제이션 이점이 사라질 수 있다(현재 `NotesContext`의 `setNotes` 갱신 방식상 문제 없음).

### ADR-002: 매칭 로직 재사용과 하이라이트 렌더링

- **Context**: 검색 결과 하이라이트(`spec-fixed.md` 결정 #8)를 구현하려면 "어느 부분이 일치했는지" 위치 정보가 있어야 한다. 이 매칭 판정 로직(trim + 대소문자 무시 + 부분 문자열)은 `useNoteSearch`의 필터링에도, `NoteItem`의 하이라이트 렌더링에도 똑같이 필요하다 — 두 곳에 각자 구현하면 중복되고, 기준이 어긋날 위험이 있다.
- **Decision**: 매칭 판정과 일치 구간 탐색을 순수 함수 `findMatchRanges(text: string, query: string): { start: number; end: number }[]`로 `src/utils/textMatch.ts`에 만든다. **`query.trim()`이 빈 문자열이면 `findMatchRanges`는 즉시 `[]`를 반환한다** — `"abc".includes("")`가 `true`인 JS 특성 때문에, 이 가드가 없으면 빈 쿼리가 "전체 일치"로 잘못 해석되거나(모든 노트가 필터링 없이 매치 처리됨은 의도와 같지만 우연이며, `indexOf` 기반 구현에서는 매치 인덱스가 전진하지 않아 무한 루프로 이어질 수 있다) 위험하다. `useNoteSearch`는 이 함수의 결과가 비어있지 않은지로 필터링하되, trim된 쿼리가 빈 문자열인 경우는 이 함수를 아예 호출하지 않고 전체 `notes`를 그대로 반환한다(ADR-001). `NoteItem`은 `title`/`content`를 렌더링할 때 이 함수로 구간을 찾아 일치 부분만 `<mark className="bg-tertiary-container/40">`로 감싸는 작은 헬퍼(`renderHighlighted(text, query)`)를 사용한다(색상 토큰 근거는 `spec-fixed.md` 결정 #8). `NoteItem`은 `query: string` prop을 새로 받는다(하이라이트가 필요 없으면 빈 문자열 — 이 경우 `findMatchRanges`가 `[]`를 반환하므로 `renderHighlighted`는 원문을 그대로 반환한다).
- **Alternatives**:
  - `useNoteSearch`가 이미 계산한 매치 위치를 `filteredNotes`의 각 노트에 함께 담아 반환(`{ note, titleRanges, contentRanges }`) — 기각. `NoteItem`이 이미 `note`를 통째로 받는 기존 인터페이스(`NoteItemProps`)를 깨고, 사이드바 전용 데이터 구조가 `Note` 타입 밖으로 새어나가 다른 곳(예: 나중에 검색 결과를 다른 화면에서도 재사용하려 할 때)에서 재사용하기 어려워진다.
  - `NoteItem`이 `query`를 받아 내부에서 매칭 로직을 처음부터 다시 구현 — 기각. `useNoteSearch`의 매칭 기준과 `NoteItem`의 하이라이트 기준이 서로 다른 코드로 두 번 구현되면, 나중에 한쪽만 고치고 다른 쪽을 안 고쳐 "필터링은 됐는데 하이라이트가 안 보이는" 버그가 생기기 쉽다.
- **Consequences**: (+) 매칭 기준이 `findMatchRanges` 한 곳에만 존재해 필터링과 하이라이트가 항상 같은 기준으로 동작함이 보장된다. (+) `findMatchRanges`는 순수 함수라 훅/컴포넌트 마운트 없이 바로 단위 테스트할 수 있다 — 빈 문자열/공백만 있는 쿼리, 대소문자 혼용, 특수문자가 섞인 검색어 같은 경계값을 `renderHook` 없이도 검증할 수 있어 이슈 분해 단계의 AC를 그대로 테스트 케이스로 옮기기 쉽다. (–) `NoteItem`이 `query` prop을 새로 받게 되어 시그니처가 변경된다 — 사이드바 밖(현재는 없지만 향후 생길 수 있는) 다른 곳에서 `NoteItem`을 쓴다면 이 prop을 반드시 함께 넘겨야 한다.

## 4. Out of Scope

- 태그 검색/필터링 — 이번 스펙은 제목+본문만 대상으로 한다 (`spec-fixed.md` 결정 #1).
- 검색 결과 정렬 방식 변경(관련도순 등) — 기존 노트 목록 순서를 그대로 유지한 채 필터링만 한다.
- 검색 히스토리/최근 검색어 저장.
- 검색어 자동완성/추천.
- 서버 사이드 검색(예: json-server 쿼리 파라미터 활용) — 전량 클라이언트 필터링으로 충분하다 (`spec-fixed.md` 결정 #10).
- 정규식/고급 검색 연산자(AND/OR, 따옴표 구문검색 등) — 단순 부분 문자열 포함만 지원한다.
- 검색 결과 개수 표시 배지, 키보드 단축키(예: `Cmd+K`)로 검색창 포커스 이동.

## 5. 용어 정의

`spec-fixed.md`의 Ubiquitous Language를 그대로 따른다.

| 용어           | 정의                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| 검색어 (Query) | 사용자가 검색창에 입력한 문자열.                                          |
| 검색 대상      | 검색어와 비교하는 노트의 필드. `title`, `content` 두 필드.                |
| 일치 (Match)   | 검색 대상 필드에 검색어가 대소문자 무시 상태로 부분 문자열로 포함된 경우. |
| 하이라이트     | 목록 미리보기에서 일치한 부분을 시각적으로 강조 표시하는 것.              |
| 검색창         | 사이드바 상단에 위치한, 검색어를 입력하는 텍스트 입력 UI.                 |
