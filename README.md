## `rekordbox-parser`

[![Build Status](https://github.com/evanpurkhiser/rekordbox-parser/workflows/build/badge.svg)](https://github.com/evanpurkhiser/rekordbox-parser/actions?query=workflow%3Abuild)
[![NPM](https://img.shields.io/npm/v/rekordbox-parser)](https://www.npmjs.com/package/rekordbox-parser)

This is a JavaScript / Typescript library that provides a simple API for
parsing **Pioneer Rekordbox PDB and ANLZ files**. This library is a wrapper
around the [Kaitai Struct](https://kaitai.io/) files available in
[`crate-digger`](https://github.com/Deep-Symmetry/crate-digger/), which
describes the database format.

Thank you [**@brunchboy**](https://github.com/brunchboy) for making these
files available!

**Current `crate-digger` version:** v0.1.6

### Library usage

Parsing `PDB` files

```ts
import {parsePdb, RekordboxPdb, tableRows} from 'rekordbox-parser';
import fs from 'fs';

const {PageType} = RekordboxPdb;

// The object passed to parsePdb must be a Buffer
const pdbFile = await fs.promises.readFile('./export.pdb');
const db = parsePdb(pdbFile);

const tracksTable = db.tables.find(table => table.type === PageType.TRACKS);

// Iterate tables using the `tableRows` generator helper
for (const row of tableRows(tracksTable)) {
  console.log('==> Track ID', row.id);
  console.log(' -> ', row.title.body.text);
  console.log(' -> ', row.trackNumber);
  console.log(' -> ', row.discNumber);
  console.log(' -> ', row.duration);
  console.log(' -> ', row.sampleRate);
  console.log(' -> ', row.sampleDepth);
  console.log(' -> ', row.bitrate);
  console.log(' -> ', row.tempo / 100);
  console.log(' -> ', row.playCount);
  console.log(' -> ', row.year);
  console.log(' -> ', row.rating);
  console.log(' -> ', row.mixName.body.text);
  console.log(' -> ', row.comment.body.text);
  console.log(' -> ', row.autoloadHotcues.body.text === 'ON');
  console.log(' -> ', row.kuvoPublic.body.text === 'ON');
  console.log(' -> ', row.filePath.body.text);
  console.log(' -> ', row.filename.body.text);
  console.log(' -> ', row.fileSize);
  console.log(' -> ', row.releaseDate.body.text);
  console.log(' -> ', new Date(row.analyzeDate.body.text));
  console.log(' -> ', new Date(row.dateAdded.body.text));
  console.log('');
  console.log(' => Foreign keys');
  console.log(' -> ', row.artworkId || null);
  console.log(' -> ', row.artistId || null);
  console.log(' -> ', row.originalArtistId || null);
  console.log(' -> ', row.remixerId || null);
  console.log(' -> ', row.composerId || null);
  console.log(' -> ', row.albumId || null);
  console.log(' -> ', row.labelId || null);
  console.log(' -> ', row.genreId || null);
  console.log(' -> ', row.colorId || null);
  console.log(' -> ', row.keyId || null);
  console.log('');
}
```

Parsing `ANLZ` files

```ts
import {parseAnlz, RekordboxAnlz} from 'rekordbox-parser';
import fs from 'fs';

const {SectionTags} = RekordboxAnlz;

// The object passed to parsePdb must be a Buffer
const anlzFile = await fs.promises.readFile('./ANLZ0000.DAT');
const anlz = parseAnlz(anlzFile);

const beatGrid = anlz.sections.find(section => section.fourcc === SectionTags.BEAT_GRID);

console.log('==> Beat Grid');
console.log(beatGrid.body.beats);

const cues = anlz.sections.find(section => section.fourcc === SectionTags.CUES);

console.log('==> Cues');
console.log(cues.body.cues);

// NOTE: The are additional SectionTags that are not documented here
```

### Limitations

- The DeviceSQL file format that Pioneer uses is still not fully
  understood. Some data may be missing.

- The Typescript types are completely lacking for the result. When Katai
  Struct [gains support for
  Typescript](https://github.com/kaitai-io/kaitai_struct/issues/542) the
  result will be much better.
