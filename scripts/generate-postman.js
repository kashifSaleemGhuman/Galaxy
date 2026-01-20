#!/usr/bin/env node
/*
  Generate a Postman v2.1 collection from Next.js app router API routes
  - Scans files under src/app/api/ for route.js
  - Detects exported HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD)
  - Maps dynamic segments [id] -> :id in Postman path, preserves as {{param}} in example
  - Uses {{baseUrl}} collection variable for host
*/

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const API_ROOT = path.join(PROJECT_ROOT, 'src', 'app', 'api');
const OUTPUT = path.join(PROJECT_ROOT, 'postman_collection.json');

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.isFile() && entry.name === 'route.js') {
      files.push(full);
    }
  }
  return files;
}

function detectMethods(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const methods = new Set();
  // match exported function GET(...) or export const GET = ...
  const regexFn = /export\s+async?\s*function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/gi;
  const regexConst = /export\s+const\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*=\s*/gi;
  let m;
  while ((m = regexFn.exec(src))) methods.add(m[1].toUpperCase());
  while ((m = regexConst.exec(src))) methods.add(m[1].toUpperCase());
  // if none found, assume GET as a safe default
  if (methods.size === 0) methods.add('GET');
  return Array.from(methods).sort((a, b) => HTTP_METHODS.indexOf(a) - HTTP_METHODS.indexOf(b));
}

function extractQueryParams(filePath, method) {
  if (method !== 'GET' && method !== 'HEAD') return [];
  if (!filePath) return [];
  
  const src = fs.readFileSync(filePath, 'utf8');
  const queryParams = [];
  
  // Find the function body for this method
  const methodRegex = new RegExp(`export\\s+async?\\s*function\\s+${method}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)(?=export|$)`, 'i');
  const match = methodRegex.exec(src);
  if (!match) return [];
  
  const functionBody = match[1];
  
  // Extract searchParams.get() calls
  const searchParamsRegex = /searchParams\.get\(['"`]([^'"`]+)['"`]\)/g;
  let paramMatch;
  const seen = new Set();
  
  while ((paramMatch = searchParamsRegex.exec(functionBody)) !== null) {
    const paramName = paramMatch[1];
    if (!seen.has(paramName)) {
      seen.add(paramName);
      // Try to find default value
      const defaultValue = extractDefaultValue(functionBody, paramName);
      queryParams.push({
        key: paramName,
        value: defaultValue || '',
        description: ''
      });
    }
  }
  
  return queryParams;
}

function extractDefaultValue(functionBody, paramName) {
  // Look for patterns like: 
  // - searchParams.get('param') || defaultValue
  // - parseInt(searchParams.get('param')) || defaultValue
  // - searchParams.get('param') || ''
  const escapedParam = paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Try pattern with parseInt/parseFloat wrapper
  let regex = new RegExp('(?:parseInt|parseFloat)\\(\\s*searchParams\\.get\\([\'"`]' + escapedParam + '[\'"`]\\)\\s*\\)\\s*\\|\\|\\s*([^\\n;]+)', 'g');
  let match = regex.exec(functionBody);
  
  // If not found, try without wrapper
  if (!match) {
    regex = new RegExp('searchParams\\.get\\([\'"`]' + escapedParam + '[\'"`]\\)\\s*\\|\\|\\s*([^\\n;]+)', 'g');
    match = regex.exec(functionBody);
  }
  
  if (match) {
    const defaultValue = match[1].trim();
    // Clean up common patterns
    if (defaultValue === '1' || defaultValue === '10' || defaultValue === '20' || defaultValue === '50') {
      return defaultValue;
    }
    if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
      return defaultValue.slice(1, -1);
    }
    if (defaultValue.startsWith('"') && defaultValue.endsWith('"')) {
      return defaultValue.slice(1, -1);
    }
    // Return numeric defaults as strings for query params
    if (!isNaN(defaultValue) && defaultValue !== '') {
      return defaultValue;
    }
  }
  return null;
}

function extractBodyFields(filePath, method) {
  if (method === 'GET' || method === 'HEAD' || method === 'DELETE') return null;
  if (!filePath) return null;
  
  const src = fs.readFileSync(filePath, 'utf8');
  
  // Find the function body for this method
  const methodRegex = new RegExp(`export\\s+async?\\s*function\\s+${method}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)(?=export|$)`, 'i');
  const match = methodRegex.exec(src);
  if (!match) return null;
  
  const functionBody = match[1];
  
  // Look for await request.json() or await req.json()
  const jsonRegex = /await\s+(?:request|req)\.json\(\)/;
  if (!jsonRegex.test(functionBody)) return null;
  
  // Find destructuring pattern - can be on same line or next line after json() call
  // Pattern: const body = await request.json() followed by const { field1, ... } = body
  // OR: const { field1, ... } = await request.json()
  let destructureMatch = /(?:const|let|var)\s*\{([^}]+)\}\s*=\s*await\s+(?:request|req)\.json\(\)/s.exec(functionBody);
  
  // If not found, look for: const body = await request.json() ... const { fields } = body
  if (!destructureMatch) {
    const bodyVarMatch = /(?:const|let|var)\s+(\w+)\s*=\s*await\s+(?:request|req)\.json\(\)/s.exec(functionBody);
    if (bodyVarMatch) {
      const bodyVar = bodyVarMatch[1];
      const destructurePattern = new RegExp(`(?:const|let|var)\\s*\\{([^}]+)\}\\s*=\\s*${bodyVar}`, 's');
      destructureMatch = destructurePattern.exec(functionBody);
    }
  }
  
  if (destructureMatch) {
    const fieldsStr = destructureMatch[1];
    const bodyFields = {};
    
    // Parse individual fields: field, field = defaultValue, field: alias
    // Handle multi-line destructuring by splitting on commas and newlines
    const fieldLines = fieldsStr.split(/[,\n]/).map(f => f.trim()).filter(f => f);
    
    for (const fieldLine of fieldLines) {
      // Match: fieldName or fieldName = defaultValue
      const fieldMatch = /^\s*(\w+)(?:\s*=\s*([^=]+))?\s*$/.exec(fieldLine);
      if (!fieldMatch) continue;
      
      const fieldName = fieldMatch[1].trim();
      const defaultValue = fieldMatch[2] ? fieldMatch[2].trim() : null;
      
      // Skip rest/spread operator
      if (fieldName === '...' || fieldName.startsWith('...')) continue;
      
      // Determine type and default value
      let value = '';
      if (defaultValue) {
        // Clean up default value
        const cleaned = defaultValue
          .replace(/^['"`]|['"`]$/g, '') // Remove quotes
          .replace(/^\{|\}$/g, '') // Remove object braces
          .replace(/^\[|\]$/g, ''); // Remove array brackets
        
        if (cleaned === 'true' || cleaned === 'false') {
          value = cleaned === 'true';
        } else if (!isNaN(cleaned) && cleaned !== '') {
          value = Number(cleaned);
        } else if (cleaned === '[]') {
          value = [];
        } else if (cleaned === '{}') {
          value = {};
        } else {
          value = cleaned || '';
        }
      }
      
      bodyFields[fieldName] = value;
    }
    
    return Object.keys(bodyFields).length > 0 ? bodyFields : null;
  }
  
  // If no destructuring found, return a generic example
  return { example: true };
}

function toPostmanPath(apiPath) {
  // convert Next.js dynamic [id] to :id for Postman display and retain as path var
  return apiPath
    .split('/')
    .filter(Boolean)
    .map(seg => (seg.startsWith('[') && seg.endsWith(']') ? `:${seg.slice(1, -1)}` : seg))
    .join('/');
}

function buildItem(name, urlPath, method, filePath) {
  const rawPath = urlPath.split('/').filter(Boolean);
  const pathVars = rawPath
    .filter(p => p.startsWith(':'))
    .map(p => p.slice(1));

  const postmanPath = rawPath.map(p => (p.startsWith(':') ? `{{${p.slice(1)}}}` : p));

  // Extract query parameters for GET requests
  const queryParams = filePath ? extractQueryParams(filePath, method) : [];

  // Extract body fields for POST/PUT/PATCH requests
  const bodyFields = filePath ? extractBodyFields(filePath, method) : null;

  const item = {
    name: `${method} /${toPostmanPath(urlPath)}`,
    request: {
      method,
      header: [
        { key: 'Content-Type', value: 'application/json', disabled: method === 'GET' || method === 'HEAD' },
        { key: 'Accept', value: 'application/json' }
      ],
      url: {
        raw: `{{baseUrl}}/${toPostmanPath(urlPath)}`,
        host: ['{{baseUrl}}'],
        path: postmanPath,
        variable: pathVars.map(v => ({ key: v, value: '' })),
      },
    },
  };

  // Add query parameters for GET/HEAD requests
  if (queryParams.length > 0) {
    item.request.url.query = queryParams;
  }

  // Add body for POST/PUT/PATCH requests
  if (method !== 'GET' && method !== 'HEAD' && method !== 'DELETE') {
    if (bodyFields) {
      item.request.body = {
        mode: 'raw',
        raw: JSON.stringify(bodyFields, null, 2),
        options: { raw: { language: 'json' } },
      };
    } else {
      item.request.body = {
        mode: 'raw',
        raw: '{\n  \"example\": true\n}',
        options: { raw: { language: 'json' } },
      };
    }
  }

  return item;
}

function applySpecialCases(item, urlPath, method) {
  // NextAuth credentials sign-in should be a same-origin form POST with redirect=false
  if (urlPath === 'auth/callback/credentials' && method === 'POST') {
    item.request.url.raw = `{{baseUrl}}/auth/callback/credentials?redirect=false`;
    // Override headers for XHR-like behavior
    item.request.header = [
      { key: 'Content-Type', value: 'application/x-www-form-urlencoded' },
      { key: 'Accept', value: 'application/json' },
      { key: 'Origin', value: '{{origin}}' },
      { key: 'Referer', value: '{{origin}}/' },
      { key: 'X-Requested-With', value: 'XMLHttpRequest' }
    ];
    item.request.body = {
      mode: 'urlencoded',
      urlencoded: [
        { key: 'email', value: 'user@galaxy.com' },
        { key: 'password', value: 'user..AA22' },
        { key: 'callbackUrl', value: '{{callbackUrl}}' },
        { key: 'csrfToken', value: '{{csrfToken}}' }
      ]
    };
    item.name = 'POST /auth/callback/credentials (sign-in)';
  }

  // Prefer JSON on these endpoints
  if ((urlPath === 'auth/csrf' || urlPath === 'auth/session') && method === 'GET') {
    item.request.header = [
      { key: 'Accept', value: 'application/json' }
    ];
  }

  return item;
}

function routeFileToPath(filePath) {
  // Compute API URL path from file path under src/app/api
  const rel = path.relative(API_ROOT, path.dirname(filePath));
  // handle special folders like [...nextauth]
  return rel.split(path.sep).join('/');
}

function main() {
  if (!fs.existsSync(API_ROOT)) {
    console.error('API directory not found:', API_ROOT);
    process.exit(1);
  }

  const routeFiles = walk(API_ROOT);
  const itemsByFolder = new Map();

  for (const file of routeFiles) {
    const urlPath = routeFileToPath(file);
    const methods = detectMethods(file);
    const folder = path.dirname(path.relative(API_ROOT, file)).split(path.sep).slice(0, -1).join('/');
    const displayName = urlPath || '/';

    const routeItems = methods.map(m => applySpecialCases(buildItem(displayName, urlPath, m, file), urlPath, m));
    itemsByFolder.set(urlPath, routeItems);

    // If this is NextAuth catch-all route, add implicit NextAuth endpoints
    if (urlPath === 'auth/[...nextauth]') {
      const nextAuthExtras = [
        buildItem('NextAuth Credentials Callback', 'auth/callback/credentials', 'POST', null),
        buildItem('NextAuth Session', 'auth/session', 'GET', null),
        buildItem('NextAuth CSRF', 'auth/csrf', 'GET', null),
        buildItem('NextAuth Signout', 'auth/signout', 'POST', null),
      ];
      itemsByFolder.set('auth/callback/credentials', [nextAuthExtras[0]]);
      itemsByFolder.set('auth/session', [nextAuthExtras[1]]);
      itemsByFolder.set('auth/csrf', [nextAuthExtras[2]]);
      itemsByFolder.set('auth/signout', [nextAuthExtras[3]]);
    }
  }

  // Build a flat list under groups based on first segment
  const collection = {
    info: {
      name: 'Galaxy API',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      { key: 'baseUrl', value: 'http://localhost:3000/api' },
      { key: 'origin', value: 'http://localhost:3000' },
      { key: 'callbackUrl', value: '{{origin}}/' },
      { key: 'csrfToken', value: '' }
    ],
    item: [],
  };

  // Group by top-level segment for nicer organization
  const groups = new Map();
  for (const [urlPath, items] of itemsByFolder.entries()) {
    const segments = urlPath.split('/').filter(Boolean);
    const top = segments.length > 0 ? segments[0] : 'root';
    const restName = segments.length > 1 ? segments.slice(1).join('/') : '';
    if (!groups.has(top)) groups.set(top, []);
    const name = restName ? `/${toPostmanPath(urlPath)}` : `/${top}`;
    groups.get(top).push({ name, items });
  }

  for (const [groupName, entries] of groups.entries()) {
    const folder = {
      name: groupName === 'root' ? 'root' : groupName,
      item: [],
    };
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      // Each entry can be a subfolder to hold methods
      folder.item.push({ name: entry.name, item: entry.items });
    }
    collection.item.push(folder);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(collection, null, 2));
  console.log('Postman collection written to', OUTPUT);
}

main();


