# 컬러 & 서페이스 철학

전체 개요는 [`README.md`](README.md), Do/Don't는 [`.claude/rules/design-system.md`](../../.claude/rules/design-system.md) 참고.

## No-Line Rule ("선 없음" 규칙)

프리미엄하고 에디토리얼한 느낌을 위해, **섹션 구분에 1px 실선 보더 사용을 금지한다.** 경계는 오직 배경색 차이로만 표현한다.

- **적용 예**: `surface_container_low`(#f1f4f6) 사이드바가 `surface`(#f8f9fa) 배경 위에 바로 붙는다. 전환은 "보이는" 게 아니라 "느껴지는" 것이어야 한다.

## 색상 하드코딩 금지 (자동 검사됨)

**색상은 반드시 CSS 변수(토큰)로만 사용한다.** `bg-[#...]`, `text-[#...]`, `border-[#...]` 등 Tailwind 임의값 색상 유틸리티나 인라인 `style={{ color: '#...' }}`로 색을 하드코딩하지 않는다 — 항상 이 문서의 토큰(또는 마이그레이션 전이라면 `src/index.css`의 기존 토큰)을 쓴다. `shadow-[...]`의 rgba는 예외다 ([`elevation.md`](elevation.md) 참고 — 그림자는 색상이 아니라 elevation 관심사로 다룬다). `.claude/rules/design-system.md`의 "컴포넌트 규칙" 참고 — PostToolUse 훅이 자동으로 검사한다.

## 서페이스 계층 & 중첩

UI를 겹겹이 쌓인 물성 있는 재질처럼 다룬다. `surface-container` 단계를 중첩시켜 깊이를 만든다.

| 계층          | 토큰                       | 값        | 용도                                                     |
| ------------- | -------------------------- | --------- | -------------------------------------------------------- |
| 기본 캔버스   | `surface`                  | `#f8f9fa` | 1차 배경                                                 |
| 보조 영역     | `surface_container_low`    | `#f1f4f6` | 사이드바/내비게이션 배경                                 |
| 상호작용 요소 | `surface_container_lowest` | `#ffffff` | 우선순위 높은 카드, 활성 작업 영역 — "떠 있는 종이" 효과 |

## Glass & Gradient 규칙

떠 있는 요소(모달, 드롭다운, 호버링 브레드크럼)는 **글래스모피즘**을 쓴다.

- **토큰**: `surface`(#f8f9fa) 80% 불투명도 + `backdrop-filter: blur(12px)`
- **시그니처 텍스처**: 1차 액션(CTA)에는 `tertiary`(#0053dc) → `tertiary_container`(#3e76fe) 선형 그라디언트를 적용한다. 단일 액센트 컬러에 "보석 같은" 깊이를 더해 UI가 납작해 보이지 않게 한다.
