# 마이그레이션 — 신규 토큰 ↔ 현재 코드베이스

전체 개요는 [`README.md`](README.md) 참고. 실제 `src/index.css`/컴포넌트 스타일을 이 디자인 시스템으로 옮길 때 참고하는 문서다.

## 토큰 매핑

현재 `src/index.css`의 `@theme` 토큰은 이 디자인 시스템과 이름·값이 다르다. 아래는 개념적으로 가장 가까운 대응 관계다 (자동 치환표가 아니라 마이그레이션 시 참고용).

| 새 디자인 토큰                                                               | 값                                | 현재 `src/index.css` 변수                          | 비고                                                                                     |
| ---------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `surface`                                                                    | `#f8f9fa`                         | `--color-background` (`hsl(0 0% 94%)`)             | 값 다름 — 마이그레이션 시 값 교체 필요                                                   |
| `surface_container_lowest`                                                   | `#ffffff`                         | `--color-card` (`hsl(0 0% 100%)`)                  | 값은 사실상 동일, 이름만 교체하면 됨                                                     |
| `surface_container_low`                                                      | `#f1f4f6`                         | `--color-muted` (`hsl(0 0% 90%)`)                  | 값 다름                                                                                  |
| `surface_container` / `surface_container_high` / `surface_container_highest` | `#eaeff1` / `#e2e9ec` / `#dbe4e7` | 대응 토큰 없음                                     | 신규 추가 필요 (현재는 계층이 `card`/`muted` 2단계뿐, 새 시스템은 5단계)                 |
| `on_surface`                                                                 | `#2b3437`                         | `--color-foreground` (`hsl(220 35% 14%)`, 남색 톤) | 값·색조 모두 다름 (현재는 남색 계열, 신규는 중성 그레이)                                 |
| `on_surface_variant`                                                         | `#586064`                         | `--color-muted-foreground` (`hsl(0 0% 42%)`)       | 근접하지만 값은 다름                                                                     |
| `outline_variant`                                                            | `#abb3b7` (15% 사용)              | `--color-border` (`hsl(0 0% 88%)`)                 | 용도 자체가 다름 — 기존은 불투명 실선 보더, 신규는 15% 불투명도의 "고스트" 용도          |
| `tertiary` / `tertiary_container` / `on_tertiary`                            | `#0053dc` / `#3e76fe` / `#faf8ff` | 대응 토큰 없음                                     | 신규 추가 필요 — 현재 팔레트엔 액센트 컬러가 없고 `foreground`를 버튼 배경으로 재사용 중 |
| (대응 없음)                                                                  | —                                 | `--color-destructive` (`hsl(0 84% 60%)`)           | 새 시스템에 대응 토큰 없음 — 삭제/에러 액션용으로 그대로 유지 권장                       |

## 알려진 충돌 — 마이그레이션 필요 지점

No-Line Rule/Divider Prohibition과 직접 충돌하는, 현재 코드에서 1px 보더를 섹션 구분에 쓰고 있는 지점이다. **이 문서 작업에서는 코드를 고치지 않는다** — 실제 스타일 작업 시 아래를 우선 정리 대상으로 삼는다.

| 위치                                                         | 현재 패턴                                               | 위반 규칙    |
| ------------------------------------------------------------ | ------------------------------------------------------- | ------------ |
| `src/components/Layout.tsx` — 헤더                           | `border-b border-border`                                | No-Line Rule |
| `src/components/Layout.tsx` — 사이드바                       | `border-r border-border`                                | No-Line Rule |
| `src/components/NoteItem.tsx` — 카드 외곽                    | `border` + `border-border`/`border-foreground`(선택 시) | No-Line Rule |
| `src/components/NoteEditor.tsx` — 에디터 카드 외곽           | `border border-border`                                  | No-Line Rule |
| `src/components/NoteEditor.tsx` — 제목/태그/내용 사이 구분선 | `h-px bg-border`                                        | No-Line Rule |
| `src/components/NoteEditor.tsx` — 저장/취소 버튼 영역        | `border-t border-border`                                | No-Line Rule |
