#!/usr/bin/env node
// Husky pre-commit gate: scans staged changes for likely secrets before they
// enter git history. Runs regardless of who/what triggers the commit
// (human, Claude Code, CI) — that's the point, unlike a Claude Code-only hook.

const { execFileSync } = require('child_process');

function stagedFiles() {
  const out = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], {
    encoding: 'utf8',
  });
  return out.split('\n').filter(Boolean);
}

function addedLines(file) {
  let diff;
  try {
    diff = execFileSync('git', ['diff', '--cached', '-U0', '--', file], { encoding: 'utf8' });
  } catch {
    return [];
  }
  return diff
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
    .map((line) => line.slice(1));
}

function isBlockedEnvFile(file) {
  const base = file.split('/').pop();
  if (!/^\.env(\..+)?$/.test(base)) return false;
  return !/^\.env\.(example|sample|template)$/.test(base);
}

const SECRET_PATTERNS = [
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z-]{10,48}/ },
  { name: 'GitHub Token', regex: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  { name: 'Stripe Live Secret Key', regex: /sk_live_[0-9a-zA-Z]{16,}/ },
  {
    name: 'Private Key Block',
    regex: /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/,
  },
  {
    name: '하드코딩된 시크릿 할당',
    regex:
      /\b(api[_-]?key|secret|password|passwd|access[_-]?key|auth[_-]?token)\b\s*[:=]\s*['"][A-Za-z0-9_\-/+=]{8,}['"]/i,
  },
];

function main() {
  const files = stagedFiles();
  const violations = [];

  for (const file of files) {
    if (isBlockedEnvFile(file)) {
      violations.push(`${file}: .env 계열 파일은 커밋 대상이 아님 (내용 무관, 파일명만으로 차단)`);
      continue;
    }

    const lines = addedLines(file);
    for (const line of lines) {
      for (const { name, regex } of SECRET_PATTERNS) {
        if (regex.test(line)) {
          violations.push(`${file}: ${name} 패턴 감지 — "${line.trim().slice(0, 80)}"`);
        }
      }
    }
  }

  if (violations.length === 0) {
    process.exit(0);
  }

  console.error('🔒 커밋 차단 — 시크릿으로 의심되는 내용이 있습니다:\n');
  for (const v of violations) {
    console.error(`- ${v}`);
  }
  console.error(
    '\n실제 시크릿이면 값을 제거하고 .env(gitignore됨)로 옮기세요. 오탐이면 scripts/check-secrets.cjs의 패턴을 조정하세요.',
  );
  process.exit(1);
}

main();
