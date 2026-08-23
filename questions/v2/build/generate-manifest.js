#!/usr/bin/env node
// questions/v2/build/generate-manifest.js
//
// Phase 1.2 packaging fix. The previous exported Phase 1.1 ZIP's MANIFEST
// had a wrong file count and a single blank filename entry under
// "## Files included" (it said "(1)" and listed `- `` `). That happened
// because the manifest's file list was hand-typed instead of generated
// from the files actually being archived.
//
// This script fixes that by *walking the real filesystem* for every
// directory that is part of a QS v2 export archive and emitting a
// Markdown section with an accurate count and one non-blank
// repository-relative path per line — deterministic (sorted) and
// dependency-free, matching every other tool in questions/v2/.
//
// Usage:
//   node questions/v2/build/generate-manifest.js [--out <file>] [dir ...]
//
// With no positional [dir ...] args, defaults to the standard Phase 1.x
// QS v2 archive contents: questions/v2/ and docs/question-system-v2/.
// The manifest file itself (--out target, if given and it already exists
// on disk relative to repo root) is also included in the listing, since
// it ships inside the same archive.
//
// This is packaging tooling only: it does not read or write any
// curriculum/template/generator/renderer content, and is not referenced
// by index.html, questions/index.js, or any production code path.

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..', '..', '..');

function walkFiles(absDir) {
  const out = [];
  if (!fs.existsSync(absDir)) return out;
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

/**
 * @param {string[]} relDirs repository-relative directories to include (e.g. "questions/v2")
 * @param {string} [manifestRelPath] repository-relative path of the manifest file itself, included if present
 * @returns {string[]} sorted, repository-relative, forward-slash file paths — every entry non-empty
 */
function collectManifestFiles(relDirs, manifestRelPath) {
  const files = new Set();
  for (const relDir of relDirs) {
    const absDir = path.join(REPO_ROOT, relDir);
    for (const abs of walkFiles(absDir)) {
      const rel = path.relative(REPO_ROOT, abs).split(path.sep).join('/');
      if (rel) files.add(rel);
    }
  }
  if (manifestRelPath) {
    const absManifest = path.join(REPO_ROOT, manifestRelPath);
    if (fs.existsSync(absManifest)) files.add(manifestRelPath);
  }
  // Defensive: a blank/whitespace-only entry must never reach the output.
  return Array.from(files)
    .filter((f) => f && f.trim().length > 0)
    .sort();
}

function currentCommitHash() {
  try {
    return execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch (err) {
    return null; // e.g. not a git checkout / no commits yet — caller decides how to report this
  }
}

function isWorkingTreeClean() {
  try {
    const status = execSync('git status --porcelain', { cwd: REPO_ROOT, encoding: 'utf8' });
    return status.trim().length === 0;
  } catch (err) {
    return null;
  }
}

/**
 * Render the "## Files included (N)" Markdown section used by the
 * Phase 1.x MANIFEST documents.
 */
function renderFilesIncludedSection(files) {
  const lines = [`## Files included (${files.length})`, ''];
  for (const f of files) lines.push(`- \`${f}\``);
  return lines.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);
  let outFile = null;
  const dirArgs = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out') {
      outFile = args[++i];
    } else {
      dirArgs.push(args[i]);
    }
  }
  const relDirs = dirArgs.length > 0 ? dirArgs : ['questions/v2', 'docs/question-system-v2'];
  const manifestRelPath = outFile ? path.relative(REPO_ROOT, path.resolve(REPO_ROOT, outFile)).split(path.sep).join('/') : null;

  const files = collectManifestFiles(relDirs, manifestRelPath);
  const commitHash = currentCommitHash();
  const clean = isWorkingTreeClean();

  const section = renderFilesIncludedSection(files);

  if (outFile) {
    fs.writeFileSync(path.resolve(REPO_ROOT, outFile), section, 'utf8');
    console.log(`Wrote ${files.length} file entries to ${outFile}`);
  } else {
    process.stdout.write(section);
  }
  console.error(`commit: ${commitHash || '(unknown — not a git checkout)'}`);
  console.error(`working tree clean: ${clean === null ? '(unknown)' : clean}`);
}

module.exports = { collectManifestFiles, renderFilesIncludedSection, currentCommitHash, isWorkingTreeClean };

if (require.main === module) {
  main();
}
