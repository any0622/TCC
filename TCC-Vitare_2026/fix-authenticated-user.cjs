const fs = require('fs');
const path = require('path');

const apiSrc = '/workspace/app/TCC-Vitare_2026/apps/api/src';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      callback(fullPath);
    }
  });
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Fix: import { CurrentUser, AuthenticatedUser } from ... -> import { CurrentUser } from ...; import type { AuthenticatedUser } from ...
  const importRegex = /import\s+\{\s*CurrentUser\s*,\s*AuthenticatedUser\s*\}\s+from\s+['"]([^'"]+)['"]/g;
  content = content.replace(importRegex, (match, from) => {
    return `import { CurrentUser } from '${from}';\nimport type { AuthenticatedUser } from '${from}'`;
  });
  
  // Also fix: import { AuthenticatedUser } from ... (alone)
  const importAuthenticatedOnly = /import\s+\{\s*AuthenticatedUser\s*\}\s+from\s+['"]([^'"]+)['"]/g;
  content = content.replace(importAuthenticatedOnly, (match, from) => {
    return `import type { AuthenticatedUser } from '${from}'`;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      callback(fullPath);
    }
  });
}

walk(apiSrc, fixFile);
console.log('AuthenticatedUser import fixes applied');
