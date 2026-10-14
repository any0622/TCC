const fs = require('fs');
const path = require('path');

const apiSrc = '/workspace/app/TCC-Vitare_2026/apps/api/src';
const projectRoot = '/workspace/app/TCC-Vitare_2026/apps/api';

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

function getRelativeImport(fromFile, toModule) {
  let match = toModule.match(/^@infra\/prisma\/prisma\.service$/);
  if (match) {
    let targetPath = path.join(projectRoot, 'src/infra/prisma/prisma.service.ts');
    let relative = path.relative(path.dirname(fromFile), targetPath);
    return relative.replace(/\\/g, '/').replace(/\.ts$/, '');
  }
  return null;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Fix PrismaService imports
  const prismaImportRegex = /from\s+['"](?:@infra\/prisma\/prisma\.service|.+\/infra\/prisma\/prisma\.service)['"]/g;
  content = content.replace(prismaImportRegex, (match) => {
    let relative = getRelativeImport(filePath, '@infra/prisma/prisma.service');
    if (relative) {
      return 'from \'' + relative + '\'';
    }
    return match;
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
console.log('Prisma import fixes applied');
