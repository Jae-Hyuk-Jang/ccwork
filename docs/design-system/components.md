# 컴포넌트

전체 개요는 [`README.md`](README.md) 참고.

## 버튼

| 종류             | 배경                                       | 텍스트                 | 비고                                 |
| ---------------- | ------------------------------------------ | ---------------------- | ------------------------------------ |
| Primary          | `tertiary`→`tertiary_container` 그라디언트 | `on_tertiary`(#faf8ff) | roundedness `md`(0.375rem)           |
| Secondary        | `surface_container_high`(#e2e9ec)          | `on_surface`           | 보더 없음                            |
| Tertiary (Ghost) | 없음                                       | `tertiary`(#0053dc)    | 호버 시 액센트 컬러 2% 불투명도 배경 |

**API 규칙 (자동 검사됨)**: 컴포넌트명에 "Button"이 들어가면 반드시 `disabled: boolean`을 Props로 받는다. `.claude/rules/design-system.md`의 "컴포넌트 규칙" 참고 — PostToolUse 훅이 자동으로 검사한다.

## 카드 & 리스트

- **구분선 금지(Divider Prohibition)**: 리스트 아이템 사이에 선을 쓰지 않는다. **스페이싱 스케일**을 쓴다 — 아이템 간 표준 간격은 `spacing.4`(1.4rem).
- **호버 상태**: 배경이 `surface` → `surface_container_low`(#f1f4f6)로 전환.

## 입력 필드

- **미니멀 입력**: 텍스트 입력은 `surface_container_lowest`(#ffffff) 배경 + 1px "고스트 보더", 포커스 시에만 1px `tertiary`(#0053dc) 보더로 전환.
- **라벨**: 항상 `label-md`를 입력창 위, `spacing.1` 간격으로 배치.
- **접근성 규칙 (자동 검사됨)**: 모든 `<input>`은 `aria-label` 또는 `aria-labelledby`를 반드시 가진다. `.claude/rules/design-system.md`의 "컴포넌트 규칙" 참고 — PostToolUse 훅이 자동으로 검사한다.

## "Knowledge Token" (커스텀 칩)

주제 태그용 (예: #javascript, #design).

- **스타일**: `surface_container_highest`(#dbe4e7) 배경, `on_surface_variant`(#586064) 텍스트, `full` roundedness. 보더 없음.
