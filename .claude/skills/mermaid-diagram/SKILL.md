---
name: mermaid-diagram
description: 이 저장소의 src/를 분석해 컴포넌트 트리·데이터 흐름·상태 맵, 컬러가 적용된 Mermaid 다이어그램 3종을 담은 HTML을 생성하고 브라우저로 바로 연다. 사용자가 "구조도", "아키텍처 다이어그램", "컴포넌트 의존성", "데이터 흐름", "상태 흐름/상태 맵", "mermaid"를 언급하거나, 이 프로젝트의 구조·아키텍처를 시각화·문서화하고 싶어하면 "다이어그램 그려줘"처럼 직접 요청하지 않았더라도 이 스킬을 사용한다.
---

# Mermaid Diagram Skill

먼저 저장소 루트의 `CLAUDE.md`를 읽는다 — 계층 구조(entry → provider → layout → feature 컴포넌트 → api)와 Context 패턴이 이미 정리되어 있어, 이 스킬이 그리는 다이어그램의 뼈대와 일치해야 한다. 구조가 바뀌었는데 다이어그램이 예전 상태를 보여주면 다이어그램 쪽이 틀린 것이다.

## 단계 1: 분석 및 다이어그램 3종 작성

`src/` 디렉토리를 스캔해서 다음 세 가지 다이어그램을 Mermaid 구문으로 작성한다.

1. **컴포넌트 트리** (`graph TD`) — 파일별 import 관계(entry → provider → layout → feature 컴포넌트 → api 계층)를 계층(subgraph)으로 묶어서 표현한다.
2. **데이터 흐름** (`flowchart LR`) — API 서버 ↔ api 계층 ↔ Context ↔ UI 컴포넌트 사이에서 요청/응답이 실제로 어떻게 오가는지(fetch, CRUD 호출, 응답으로 로컬 배열 갱신 등) 표현한다.
3. **상태 맵** (`flowchart` 또는 `graph`) — 전역 상태(Context: `notes`/`loading`/`error`)와 로컬 UI 상태(컴포넌트 `useState`, 예: `App.tsx`의 `selectedNoteId`/`isCreating`)를 한눈에 구분해서 보여준다. 어떤 상태가 어디에 있고 누가 소유하는지가 핵심이며, 데이터 흐름도와 달리 요청/응답 순서가 아니라 "상태의 소재"에 집중한다.

세 다이어그램은 서로 다른 질문에 답한다: 트리는 "무엇이 무엇을 참조하는가", 데이터 흐름은 "요청과 응답이 어떤 경로로 움직이는가", 상태 맵은 "상태가 어디에 있고 누가 소유하는가". 하나로 합치면 뒤섞이므로 항상 세 장으로 분리해서 그린다.

## 단계 2: HTML 생성

`docs/architecture/index.html`에 파일을 생성한다 (디렉토리가 없으면 생성).

- Mermaid.js를 CDN으로 포함한다.
- 어두운 테마를 적용한다 (배경 `#1a1a1a`).
- 세 다이어그램 모두 각각 `<pre class="mermaid">...</pre>` 블록에 넣고, `mermaid.initialize({ startOnLoad: true, theme: 'dark' })`로 렌더링한다.
- **색상을 반드시 사용한다.** `classDef`로 의미 있는 그룹별 색을 지정하고 노드에 `class`로 적용한다 (예: 컴포넌트 트리는 계층별 색, 데이터 흐름은 요청/응답 방향이나 계층별 색, 상태 맵은 전역 상태 vs 로컬 상태를 다른 색으로 — 어두운 배경(`#1a1a1a`) 위에서도 잘 보이도록 채도 있는 fill과 밝은 stroke/글자색을 쓴다).
- 다이어그램마다 제목과 1~2줄 설명을 붙여 무엇을 보여주는지 알 수 있게 한다.
- 재생성할 때마다 기존 파일을 덮어쓴다 (append하지 않는다).

## 단계 3: 브라우저 실행

생성한 HTML을 환경에 맞는 명령으로 즉시 연다. 실행 전에 어떤 환경인지 판별한다 — WSL은 `uname -s`로는 Linux로 보이지만 일반 Linux와 달리 `xdg-open`이 없는 경우가 많고, 대신 Windows 쪽 `explorer.exe`로 열어야 한다.

- WSL: `grep -qi microsoft /proc/version`으로 판별하고, `explorer.exe "$(wslpath -w docs/architecture/index.html)"`로 연다. `explorer.exe`는 정상적으로 열려도 종료 코드 1을 반환할 수 있으므로 이를 실패로 취급하지 않는다.
- macOS: `open docs/architecture/index.html`
- Linux (WSL 아닌 경우): `xdg-open docs/architecture/index.html`

## 완료 보고

브라우저가 열리면 다음과 같이 보고한다:

> 아키텍처 다이어그램이 브라우저에서 열렸습니다.
