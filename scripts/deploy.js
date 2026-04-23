#!/usr/bin/env node
const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const publicDir = path.join(repoRoot, 'public');
const staticDir = path.join(repoRoot, 'static');

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { stdio: 'inherit', ...opts });
}

function getLfsTrackedRelativePaths() {
  const out = execSync('git lfs ls-files -n', { cwd: repoRoot, encoding: 'utf8' });
  return out
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map(p => p.replace(/^static\//, ''));
}

function removeBuiltLfsCopies(relPaths) {
  const removed = [];
  for (const rel of relPaths) {
    const builtPath = path.join(publicDir, rel);
    if (fs.existsSync(builtPath) && fs.statSync(builtPath).isFile()) {
      fs.unlinkSync(builtPath);
      removed.push(rel);
    }
  }
  return removed;
}

function main() {
  console.log('> generate popular articles');
  run('npm', ['run', 'generate:popular']);

  console.log('> build Gatsby site');
  run('npx', ['gatsby', 'build']);

  console.log('> detect LFS-tracked static assets');
  const lfsPaths = getLfsTrackedRelativePaths();
  if (lfsPaths.length) {
    console.log(`Found ${lfsPaths.length} LFS-tracked static asset(s).`);
  } else {
    console.log('No LFS-tracked static assets found.');
  }

  console.log('> remove built copies of LFS-tracked assets from public/ before gh-pages publish');
  const removed = removeBuiltLfsCopies(lfsPaths);
  if (removed.length) {
    for (const rel of removed) console.log(`Removed from public/: ${rel}`);
  } else {
    console.log('No built LFS copies needed removal.');
  }

  // Copy static Coming Soon index.html to override Gatsby build
  const staticIndexSrc = path.join(repoRoot, 'static', 'index.html');
  const publicIndexDest = path.join(publicDir, 'index.html');
  if (fs.existsSync(staticIndexSrc)) {
    console.log('> copy static Coming Soon index.html to public/');
    fs.copyFileSync(staticIndexSrc, publicIndexDest);
  }

  console.log('> publish public/ to gh-pages');
  run('npx', ['gh-pages', '-d', 'public', '-t']);
}

main();
