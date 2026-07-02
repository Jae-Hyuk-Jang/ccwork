---
name: verify-ui-change
description: 이 저장소(React 19 + Vite notes app)의 UI 변경을 실제로 브라우저에서 구동해 검증한다. 컴포넌트를 추가/수정했거나, "UI 검증해줘", "화면에서 확인해줘", "스크린샷 찍어줘", "앱 실행해서 확인"처럼 실제로 렌더링된 결과를 봐야 할 때 사용한다. 타입체크/린트/테스트 통과만으로는 부족하다 — 이 스킬은 npm run dev로 앱을 띄우고 헤드리스 브라우저로 화면을 직접 찍어서 보여준다.
---

# UI 변경 검증 스킬

타입체크(`tsc --noEmit`)와 린트가 통과해도 실제 화면은 다를 수 있다. 이 스킬은 이 프로젝트를 실제로 띄우고 헤드리스 브라우저로 조작해 스크린샷을 남기는, 검증된 방법을 담고 있다 (한 번 직접 겪으며 확인한 절차 그대로).

## 1. 개발 서버 기동

`npm run dev`는 `concurrently`로 Vite(:5173)와 json-server(:3001)를 동시에 띄운다 (`CLAUDE.md` 참고 — API 서버 없이는 노트 목록이 로드되지 않는다).

```bash
(npm run dev > /tmp/notes-app-dev.log 2>&1 &)
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
timeout 15 bash -c 'until curl -sf http://localhost:3001/notes >/dev/null; do sleep 1; done'
```

`sleep`로 고정 시간 기다리지 말고 반드시 포트를 폴링한다 (Vite 첫 컴파일은 느릴 수 있다).

## 2. 브라우저로 구동

이 환경에는 `chromium-cli`가 없다. 대신 Playwright를 임시로 설치해서 쓴다 (프로젝트의 실제 의존성이 아니므로 `--no-save`로 설치해 `package.json`을 건드리지 않는다).

```bash
npm install --no-save playwright@1.61.1
npx playwright install chromium   # --with-deps 붙이지 말 것 — 이 환경엔 sudo가 없어서 실패한다
```

`~/.cache/ms-playwright`에 이미 크로미움이 있으면 `playwright install`은 빠르게 스킵되니 매번 다시 받을까 걱정하지 않아도 된다.

드라이버 스크립트는 **반드시 프로젝트 디렉토리 안에서** 실행한다 (node의 ESM 모듈 해석이 실행 위치의 `node_modules`를 기준으로 하므로, 스크래치패드 등 프로젝트 밖에서 실행하면 `playwright` 모듈을 못 찾는다). 스크립트 자체는 임시 파일이니 세션 스크래치패드 디렉토리에 써도 되지만, 실행은 `cd`나 절대경로로 프로젝트 루트에서 한다.

```js
// 예: verify-ui.mjs (프로젝트 루트에서 node로 실행)
import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto('http://localhost:5173');
await page.waitForSelector('text=노트', { timeout: 15000 }); // 사이드바 렌더링 대기

// --- 여기서부터 검증하려는 변경사항에 맞게 상호작용 ---
// 예: 특정 노트 클릭, 새 노트 작성, 태그 뱃지 확인 등
// React controlled input은 el.value 직접 대입이 아니라 page.fill()/page.type()을 써야 onChange가 발동한다.

await page.screenshot({ path: '/tmp/notes-app-ui-check/screenshot.png', fullPage: true });
console.log('console errors:', JSON.stringify(errors));
await browser.close();
```

```bash
mkdir -p /tmp/notes-app-ui-check
node verify-ui.mjs
```

스크린샷을 Read 도구로 열어서 **실제로 눈으로 확인**한다 — 빈 화면이나 로딩 상태만 찍혔다면 실패로 간주하고 `wait-for` 대상을 바꾸거나 더 기다린다. `console errors`가 비어있지 않으면 데이터 페치 실패 등 화면 뒤에서 조용히 깨진 부분이 있다는 뜻이니 먼저 원인을 확인한다.

## 3. 정리

검증이 끝나면 반드시 정리한다 — 다음 실행이 `EADDRINUSE`로 실패하지 않도록.

```bash
pkill -f concurrently
pkill -f "node .*/node_modules/.bin/vite"
pkill -f "node .*/node_modules/.bin/json-server"
npm uninstall playwright --no-save   # 임시 설치였으므로 제거
rm -f verify-ui.mjs                  # 프로젝트 루트에 남기지 않는다
```

`git status`로 `db.json`이나 소스 파일에 검증용으로 남긴 임시 변경이 없는지 마지막으로 확인한다.

## 참고

- 컴포넌트 작성 컨벤션(named export, Props 인터페이스 등)은 `CLAUDE.md`를 따른다 — 검증 대상 컴포넌트가 그 규칙을 지켰는지도 함께 확인한다.
- 아키텍처 자체(의존성/상태 흐름)를 보고 싶을 땐 이 스킬이 아니라 `mermaid-diagram` 스킬을 쓴다 — 이건 "실제로 렌더링되는 화면"을 검증하는 용도다.
