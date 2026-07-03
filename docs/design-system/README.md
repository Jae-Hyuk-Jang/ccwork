# 디자인 시스템: The Digital Atelier

Stitch에서 제공받은 노트 앱용 디자인 시스템 전략서를 이 저장소 문서 컨벤션에 맞게 정리한 버전이다. 앞으로 색상·타이포그래피·컴포넌트 스타일·보더/구분선 등 **시각적인 스타일 작업은 이 문서 세트를 기준으로 진행한다.**

**Do & Don't 체크리스트는 이 저장소의 정본 위치인 [`.claude/rules/design-system.md`](../../.claude/rules/design-system.md)에 있다** — `src/components/**/*.tsx`, `src/index.css`, `docs/design-system/**/*.md` 중 하나를 건드릴 때 자동으로 컨텍스트에 뜬다. 여기서는 중복 보관하지 않는다.

## 개요 & 크리에이티브 방향 (North Star)

**Creative North Star: The Curated Archive**

이 디자인 시스템은 흔한 "지식 베이스" 템플릿을 넘어, 고급 디지털 아뜰리에(atelier)의 철학을 지향한다. Notion류의 실용성에서 출발하되, 실행은 **Soft Minimalism**으로 넘어간다. 하나의 "Today I Learned"(TIL) 기록을 단순 데이터가 아니라, 개인 박물관에 놓인 소중한 표본처럼 다룬다.

일반적인 "SaaS스러움"에서 벗어나기 위한 두 축은 **의도된 비대칭(Intentional Asymmetry)**과 **톤 깊이(Tonal Depth)**다. 콘텐츠를 각진 보더 컨테이너에 가두는 대신, 중립 톤이 겹겹이 쌓인 층 위에 콘텐츠가 떠 있는 것처럼("The Curated Archive") 배치해 타이포그래피가 숨 쉬고 정보가 중심이 되게 한다. UI는 학습이라는 "조용한" 순간과 절대 경쟁하지 않아야 한다.

## 문서 구성

이 디자인 시스템은 주제별로 파일이 나뉘어 있다. 필요한 것만 열어보면 된다.

| 문서                                       | 내용                                                     |
| ------------------------------------------ | -------------------------------------------------------- |
| [`colors-surfaces.md`](colors-surfaces.md) | No-Line Rule, 서페이스 계층, Glass & Gradient            |
| [`typography.md`](typography.md)           | Display/Headline/Body/Label 스케일                       |
| [`elevation.md`](elevation.md)             | 톤 레이어링, 앰비언트 그림자, 고스트 보더                |
| [`components.md`](components.md)           | 버튼, 카드 & 리스트, 입력 필드, Knowledge Token(태그 칩) |
| [`spacing.md`](spacing.md)                 | 스페이싱 스케일                                          |
| [`migration.md`](migration.md)             | 신규 토큰 ↔ 현재 `src/index.css` 매핑, 알려진 충돌 목록  |

## 참고

- 원본 전략서: 사용자가 Stitch에서 제공한 "Design System Strategy: The Digital Atelier" (영문).
- 현재 프로젝트 스타일 컨벤션(Tailwind v4, 토큰 정의 위치)은 `CLAUDE.md`의 `## Conventions` 참고.
