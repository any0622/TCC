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
  let match = toModule.match(/^@common\/decorators\/(.+)$/);
  if (match) {
    let targetPath = path.join(projectRoot, 'src/common/decorators', match[1]);
    if (!targetPath.endsWith('.ts')) {
      targetPath = targetPath + '.ts';
    }
    let relative = path.relative(path.dirname(fromFile), targetPath);
    return relative.replace(/\\/g, '/').replace(/\.ts$/, '');
  }
  return null;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Fix @common/decorators imports
  const commonImportRegex = /from\s+['"]@common\/decorators\/([^'"]+)['"]/g;
  content = content.replace(commonImportRegex, (match, modulePath) => {
    let relative = getRelativeImport(filePath, '@common/decorators/' + modulePath);
    if (relative) {
      return 'from \'' + relative + '\'';
    }
    return match;
  });
  
  // Fix @config imports
  const configImportRegex = /from\s+['"]@config\/([^'"]+)['"]/g;
  content = content.replace(configImportRegex, (match, modulePath) => {
    let targetPath = path.join(projectRoot, 'src/config', modulePath);
    if (!targetPath.endsWith('.ts')) {
      targetPath = targetPath + '.ts';
    }
    let relative = path.relative(path.dirname(filePath), targetPath);
    relative = relative.replace(/\\/g, '/').replace(/\.ts$/, '');
    return 'from \'' + relative + '\'';
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
console.log('Common import fixes applied');
