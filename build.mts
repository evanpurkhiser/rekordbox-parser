import fetch from 'node-fetch';
import {Endpoints} from '@octokit/types';
import KaitaiStructCompiler from 'kaitai-struct-compiler';
import {parse} from 'yaml';

import {promises as fs} from 'fs';
import * as path from 'path';

type Release = Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data'];

const REPO = 'deep-symmetry/crate-digger';

/**
 * Location where the compiled KSY files are saved
 */
const OUTPUT_FOLDER = './lib';

async function latestVersion() {
  const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
  const release = await response.json();

  return release as Release;
}

/**
 * Fetches the ksy file from crate-digger
 */
async function fetchKaitaiFile(version: string, name: string) {
  const url = `https://github.com/${REPO}/raw/${version}/src/main/kaitai/${name}.ksy`;
  const response = await fetch(url);

  return await response.text();
}

/**
 * Compilse a ksy yaml file and resutnrs the rsulting [filename, content]
 */
async function compileKaitaiFile(ksy: string) {
  const compiler = new KaitaiStructCompiler();
  const result = await compiler.compile('javascript', parse(ksy), null, false);
  const files = Object.entries(result);

  if (files.length !== 1) {
    console.error(`Unexpected multiple files compiled`);
  }

  return files[0] as [filename: string, content: string];
}

async function buildFile(version: string, name: string) {
  console.log(` -> Building ${name}@${version}`);

  const kaitaiFile = await fetchKaitaiFile(version, name);
  const [fileName, content] = await compileKaitaiFile(kaitaiFile);

  await fs.writeFile(path.join(OUTPUT_FOLDER, fileName), content);
}

// Fetch the latest version
const latest = await latestVersion();
console.log(`==> Building kaitai files from crate-dikker ${latest.tag_name}`);

// Ensure the build directory exists
fs.mkdir(OUTPUT_FOLDER, {recursive: true});

await Promise.all([
  buildFile(latest.tag_name, 'rekordbox_anlz'),
  buildFile(latest.tag_name, 'rekordbox_pdb'),
]);
