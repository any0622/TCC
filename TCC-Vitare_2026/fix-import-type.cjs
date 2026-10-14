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

function fixImportType(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Find all imports and track which types are used in constructor parameters
  const importLines = content.match(/^import\s+.*from\s+['"][^'"]+['"];?/gm) || [];
  const imports = new Map();
  
  for (const line of importLines) {
    // Match: import { Type1, Type2 } from '...'
    const match = line.match(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/);
    if (match) {
      const types = match[1].split(',').map(t => t.trim());
      const from = match[2];
      for (const type of types) {
        imports.set(type, from);
      }
    }
    
    // Match: import Type from '...'
    const matchDefault = line.match(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
    if (matchDefault) {
      imports.set(matchDefault[1], matchDefault[2]);
    }
  }
  
  // Find types used in constructor parameters
  const constructorMatches = content.match(/constructor\s*\([\s\S]*?\)/g) || [];
  const usedInConstructor = new Set();
  
  for (const constructor of constructorMatches) {
    // Match private readonly xxx: Type
    const paramMatches = constructor.match(/private\s+readonly\s+\w+:\s*(\w+)/g) || [];
    for (const param of paramMatches) {
      const typeMatch = param.match(/:\s*(\w+)/);
      if (typeMatch) {
        usedInConstructor.add(typeMatch[1]);
      }
    }
  }
  
  // Now modify imports to add import type for types used in constructor
  let lines = content.split('\n');
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if this is an import line that imports types used in constructor
    const importMatch = line.match(/^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"];?$/);
    if (importMatch) {
      const types = importMatch[1].split(',').map(t => t.trim());
      const from = importMatch[2];
      const needsType = types.some(t => usedInConstructor.has(t));
      
      if (needsType && !line.startsWith('import type')) {
        // Split into type imports and regular imports
        const typeImports = types.filter(t => usedInConstructor.has(t));
        const regularImports = types.filter(t => !usedInConstructor.has(t));
        
        if (typeImports.length > 0) {
          const typeImportLine = `import type { ${typeImports.join(', ')} } from '${from}';`;
          if (regularImports.length > 0) {
            lines[i] = `${typeImportLine}\nimport { ${regularImports.join(', ')} } from '${from}';`;
          } else {
            lines[i] = typeImportLine;
          }
          modified = true;
        }
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    return true;
  }
  return false;
}

walk(apiSrc, fixImportType);
console.log('Import type fixes applied');
