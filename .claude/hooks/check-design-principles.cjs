#!/usr/bin/env node
// PostToolUse hook: checks src/components/**/*.tsx against 3 design principles
// after Claude edits/writes it. Exits 2 (blocking feedback) on violation.

const fs = require('fs');
const path = require('path');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function isTargetFile(filePath) {
  if (!filePath) return false;
  const normalized = filePath.split(path.sep).join('/');
  return /\/src\/components\/.*\.tsx$/.test(normalized) || /^src\/components\/.*\.tsx$/.test(normalized);
}

function checkButtonDisabledProp(content) {
  const violations = [];
  const interfaces = new Map();
  const interfaceRegex = /interface\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let m;
  while ((m = interfaceRegex.exec(content))) {
    interfaces.set(m[1], m[2]);
  }

  const funcRegex = /export function\s+(\w+)\s*\(\s*\{[\s\S]*?\}\s*:\s*(\w+)\s*\)/g;
  while ((m = funcRegex.exec(content))) {
    const [, componentName, propsTypeName] = m;
    if (!/button/i.test(componentName)) continue;
    const body = interfaces.get(propsTypeName);
    if (!body || !/\bdisabled\b/.test(body)) {
      violations.push(
        `규칙 1 위반: 컴포넌트 "${componentName}"의 Props(${propsTypeName})에 disabled가 없음`,
      );
    }
  }
  return violations;
}

function checkHardcodedColors(content) {
  const violations = [];
  const colorUtilRegex =
    /\b(?:bg|text|border|ring|fill|stroke|from|via|to)-\[(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/g;
  const utilMatches = content.match(colorUtilRegex) || [];
  if (utilMatches.length > 0) {
    violations.push(
      `규칙 2 위반: 하드코딩된 색상 Tailwind 유틸리티 ${utilMatches.length}건 (${[...new Set(utilMatches)].join(', ')})`,
    );
  }

  const inlineStyleRegex = /style=\{\{[^}]*(?:color|backgroundColor)\s*:\s*['"](#|rgb|hsl)/gi;
  const inlineMatches = content.match(inlineStyleRegex) || [];
  if (inlineMatches.length > 0) {
    violations.push(`규칙 2 위반: 인라인 style에 하드코딩된 색상 ${inlineMatches.length}건`);
  }
  return violations;
}

function checkInputAriaLabel(content) {
  const violations = [];
  const inputTagRegex = /<input\b[\s\S]*?\/?>/g;
  const tags = content.match(inputTagRegex) || [];
  const missing = tags.filter((tag) => !/aria-label(ledby)?=/.test(tag));
  if (missing.length > 0) {
    violations.push(`규칙 3 위반: <input> 요소 중 aria-label(-ledby) 없는 것 ${missing.length}건`);
  }
  return violations;
}

function main() {
  const raw = readStdin();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path || payload?.tool_response?.filePath;
  if (!isTargetFile(filePath)) {
    process.exit(0);
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    process.exit(0);
  }

  const violations = [
    ...checkButtonDisabledProp(content),
    ...checkHardcodedColors(content),
    ...checkInputAriaLabel(content),
  ];

  if (violations.length === 0) {
    process.exit(0);
  }

  console.error(`[design-system 훅] ${filePath} 위반 사항:`);
  for (const v of violations) {
    console.error(`- ${v}`);
  }
  console.error('디자인 시스템 규칙: .claude/rules/design-system.md, docs/design-system/components.md 참고');
  process.exit(2);
}

main();
