import {Endpoints} from '@octokit/types';
import KaitaiStructCompiler from 'kaitai-struct-compiler';
import fetch from 'node-fetch';
import {format} from 'prettier';
import {parse} from 'yaml';

import {promises as fs} from 'fs';
import * as path from 'path';

import prettierConfig from '../prettier.config.js';

/**
 * Location where the compiled KSY files are saved
 */
const OUTPUT_DIR = './lib';

/**
 * Name of the crate-digger repo
 */
const REPO = 'deep-symmetry/crate-digger';

/**
 * Gets the latest version object from github for crate-digger
 */
async function latestVersion() {
  const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
  const release = await response.json();

  return release as Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data'];
}

/**
 * Fetches the ksy file from crate-digger
 */
async function fetchKaitaiFile(version: string, name: string) {
  const url = `https://github.com/${REPO}/raw/${version}/src/main/kaitai/${name}.ksy`;
  const response = await fetch(url);

  return response.text();
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

/**
 * Fetches, compiles, and saves a kaitai file into OUTPUT_DIR
 */
async function buildFile(version: string, name: string) {
  process.stderr.write(` -> Building ${name}@${version}\n`);

  const kaitaiFile = await fetchKaitaiFile(version, name);
  const [fileName, content] = await compileKaitaiFile(kaitaiFile);

  // Format with prettier
  const javascript = format(content, {...prettierConfig, parser: 'babel'});

  await fs.writeFile(path.join(OUTPUT_DIR, fileName), javascript);
}

async function updatePackageVerison(version: string) {
  const packageJson = JSON.parse(await fs.readFile('./package.json', {encoding: 'utf8'}));

  const hasNewVersion = version !== packageJson.version;

  if (hasNewVersion) {
    const versionChange = `${packageJson.version} -> ${version}`;
    process.stderr.write(` -> Version updated from crate-dinner: ${versionChange}\n`);
  }

  // Update version
  packageJson.version = version;

  // Write back to pacakge.json
  await fs.writeFile(
    './package.json',
    format(JSON.stringify(packageJson, null, 2), {...prettierConfig, parser: 'json'})
  );
}

// Fetch the latest version
process.stderr.write(`==> Fetching version of crate-digger\n`);
const version = await latestVersion();

// Ensure the build directory exists
fs.mkdir(OUTPUT_DIR, {recursive: true});

process.stderr.write(`==> Building from crate-digger ${version.tag_name}\n`);
await Promise.all([
  buildFile(version.tag_name, 'rekordbox_anlz'),
  buildFile(version.tag_name, 'rekordbox_pdb'),
]);

process.stderr.write(`==> Updating version in package.json\n`);
const versionUpdated = await updatePackageVerison(version.name);

const update = {
  versionUpdated,
  version: version.name,
};

process.stdout.write(JSON.stringify(update));
