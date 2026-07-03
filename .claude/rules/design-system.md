---
paths:
  - 'src/components/**/*.tsx'
  - 'src/index.css'
  - 'docs/design-system/**/*.md'
---

# 디자인 시스템: The Digital Atelier

이 저장소의 시각적 스타일(색상, 타이포그래피, 컴포넌트, 보더/구분선 등)은 **The Digital Atelier** 디자인 시스템을 따른다. Creative North Star: _The Curated Archive_ — 콘텐츠를 각진 보더 컨테이너에 가두지 않고, 중립 톤이 겹겹이 쌓인 층 위에 콘텐츠가 떠 있는 것처럼 배치한다. UI는 "조용한" 학습의 순간과 경쟁하지 않는다.

## Do & Don't (정본 — 여기가 유일한 출처)

### Do

- 여백을 구조적 요소로 사용한다. 애매하면 마진을 늘린다.
- 사이드바의 "선택됨" 상태는 `surface_container_highest`를 쓴다.
- 액센트 컬러(`tertiary`)는 의도가 분명한 액션에만 아껴 쓴다.
- 섹션 구분은 배경색(surface 톤) 차이로만 표현한다 (No-Line Rule).
- 리스트 아이템 구분은 선이 아니라 `spacing.4`(1.4rem) 간격으로 한다 (Divider Prohibition).
- 컨테이너 경계가 접근성상 꼭 필요할 때만 `outline_variant` 15% 불투명도의 고스트 보더를 예외적으로 쓴다.
- 떠 있는 요소(모달/드롭다운)는 글래스모피즘(`surface` 80% + `blur(12px)`)을 쓴다.
- 1차 CTA에는 `tertiary`→`tertiary_container` 그라디언트로 입체감을 준다.

### Don't

- 순수 검정(`#000000`)을 텍스트에 쓰지 않는다 — `on_surface`(#2b3437)로 부드럽고 고급스러운 느낌을 유지한다.
- 기본(엔지니어링 느낌의) 그림자를 쓰지 않는다 — "디자인됨"이 아니라 "구현됨"처럼 보인다.
- 기능적으로 명확한 목적이 없으면 아이콘을 쓰지 않는다 — 이 시스템은 타이포그래피 중심이다.
- 사이드바 구분에 보더를 쓰지 않는다 — `surface_container_low` ↔ `surface` 색 전환으로 대체한다.
- 섹션/카드/리스트 구분에 1px 실선 보더를 쓰지 않는다 (No-Line Rule, Divider Prohibition).

**주의**: 현재 `src/index.css`와 컴포넌트는 아직 이 시스템으로 마이그레이션되지 않았다 (`docs/design-system/migration.md`에 알려진 충돌 목록 있음). 기존 코드의 색상/보더와 이 규칙이 다르면, **새로 작성/수정하는 코드는 이 규칙 쪽을 따른다.**

### 컴포넌트 규칙 (자동 검사됨)

아래 3개는 `.claude/hooks/check-design-principles.cjs`가 `src/components/**/*.tsx`를 Edit/Write할 때마다 자동으로 검사해서, 위반 시 커밋 전에 바로 피드백을 준다 (사람이 리뷰에서 잡을 필요 없음).

- **버튼 컴포넌트는 반드시 `disabled` 상태를 props로 받아야 한다** — 컴포넌트명에 "Button"이 포함되면 해당 Props 인터페이스에 `disabled`가 있어야 한다.
- **색상은 반드시 CSS 변수로만 사용한다 (하드코딩 금지)** — `bg-[#...]`/`text-[#...]`/`border-[#...]` 등 Tailwind 임의값 색상 유틸리티나 인라인 `style={{ color: '#...' }}` 금지. 단, `shadow-[...]`의 rgba는 예외(그림자는 색상이 아니라 elevation 관심사, [`elevation.md`](../../docs/design-system/elevation.md) 참고).
- **모든 `<input>`에는 `aria-label`(또는 `aria-labelledby`)이 있어야 한다.**

## 세부 문서 — 필요할 때만 열어볼 것

| 문서                                                                                   | 언제 열어야 하는가                                                            |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`docs/design-system/README.md`](../../docs/design-system/README.md)                   | 전체 개요, North Star 전문이 필요할 때                                        |
| [`docs/design-system/colors-surfaces.md`](../../docs/design-system/colors-surfaces.md) | 배경/서페이스 색상, 레이어 구조를 정할 때                                     |
| [`docs/design-system/typography.md`](../../docs/design-system/typography.md)           | 폰트 크기/굵기/자간을 정할 때                                                 |
| [`docs/design-system/elevation.md`](../../docs/design-system/elevation.md)             | 그림자, 카드 들뜬 느낌, 보더 대체 수단이 필요할 때                            |
| [`docs/design-system/components.md`](../../docs/design-system/components.md)           | 버튼/카드/리스트/입력창/태그 칩 등 구체적 컴포넌트 스타일을 정할 때           |
| [`docs/design-system/spacing.md`](../../docs/design-system/spacing.md)                 | 여백/간격 값을 정할 때                                                        |
| [`docs/design-system/migration.md`](../../docs/design-system/migration.md)             | 새 토큰을 실제 `src/index.css` 값에 연결하거나, 기존 보더/색상 코드를 고칠 때 |
