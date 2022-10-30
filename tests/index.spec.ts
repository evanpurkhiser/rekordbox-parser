import {expect, test} from '@jest/globals';

import {promises as fs} from 'fs';
import {join} from 'path';

import {parseAnlz, parsePdb, RekordboxAnlz, RekordboxPdb, tableRows} from '../lib/index';

function openTestFile(file: string) {
  return fs.readFile(join(__dirname, file));
}

const {PageType} = RekordboxPdb;
const {SectionTags} = RekordboxAnlz;

test('parse PDB files', async () => {
  const db = parsePdb(await openTestFile('export.pdb'));

  // Tables exist
  expect(db).toHaveProperty('tables');
  expect(db.tables).toHaveLength(20);

  // Check that all expected tables exist
  expect(db.tables.map(track => track.type)).toEqual([
    PageType.TRACKS,
    PageType.GENRES,
    PageType.ARTISTS,
    PageType.ALBUMS,
    PageType.LABELS,
    PageType.KEYS,
    PageType.COLORS,
    PageType.PLAYLIST_TREE,
    PageType.PLAYLIST_ENTRIES,
    PageType.UNKNOWN_9,
    PageType.UNKNOWN_10,
    PageType.HISTORY_PLAYLISTS,
    PageType.HISTORY_ENTRIES,
    PageType.ARTWORK,
    PageType.UNKNOWN_14,
    PageType.UNKNOWN_15,
    PageType.COLUMNS,
    PageType.UNKNOWN_17,
    PageType.UNKNOWN_18,
    PageType.HISTORY,
  ]);

  const trackTable = db.tables.find(track => track.type === PageType.TRACKS);
  const tracks = [...tableRows(trackTable)];

  expect(tracks).toHaveLength(3);

  // Spot check the first track
  expect(tracks[0].title.body.text).toEqual('Jitter 0.5');
  expect(tracks[0].trackNumber).toEqual(2);
  expect(tracks[0].discNumber).toEqual(1);
  expect(tracks[0].duration).toEqual(177);
  expect(tracks[0].sampleRate).toEqual(44100);
  expect(tracks[0].sampleDepth).toEqual(16);
  expect(tracks[0].bitrate).toEqual(320);
  expect(tracks[0].tempo / 100).toEqual(175);
  expect(tracks[0].playCount).toEqual(22);
  expect(tracks[0].year).toEqual(2010);
  expect(tracks[0].rating).toEqual(0);
  expect(tracks[0].mixName.body.text).toEqual('');
  expect(tracks[0].comment.body.text).toEqual('AWF032');
  expect(tracks[0].autoloadHotcues.body.text === 'ON').toEqual(true);
  expect(tracks[0].kuvoPublic.body.text === 'ON').toEqual(false);
  expect(tracks[0].filePath.body.text).toEqual(
    '/Contents/Orbit1/Orbit1 EP #2/02. [08A] Orbit1 - Jitter 0.5.mp3'
  );
  expect(tracks[0].filename.body.text).toEqual('02. [08A] Orbit1 - Jitter 0.5.mp3');
  expect(tracks[0].fileSize).toEqual(7422729);
  expect(tracks[0].releaseDate.body.text).toEqual('');
  expect(tracks[0].analyzeDate.body.text).toEqual('2014-07-31');
  expect(tracks[0].dateAdded.body.text).toEqual('2015-06-14');
});

test('parse DAT ANLZ files', async () => {
  const anlz = parseAnlz(await openTestFile('ANLZ0000.DAT'));

  // expected analysis sections
  expect(anlz.sections.map(section => section.fourcc)).toEqual([
    SectionTags.PATH,
    SectionTags.VBR,
    SectionTags.BEAT_GRID,
    SectionTags.WAVE_PREVIEW,
    SectionTags.WAVE_TINY,
    SectionTags.CUES,
    SectionTags.CUES,
  ]);

  const beatGrid = anlz.sections.find(
    section => section.fourcc === SectionTags.BEAT_GRID
  );

  expect(beatGrid.body.beats).toHaveLength(1106);

  // Spot check the first beat
  expect(beatGrid.body.beats[0].time).toEqual(62);
  expect(beatGrid.body.beats[0].tempo).toEqual(14000);
  expect(beatGrid.body.beats[0].beatNumber).toEqual(1);

  // TODO: Would be nice to have tests for all sections
});

test('parse EXT ANLZ files', async () => {
  const anlz = parseAnlz(await openTestFile('ANLZ0000.EXT'));

  // expected analysis sections
  expect(anlz.sections.map(section => section.fourcc)).toEqual([
    SectionTags.PATH,
    SectionTags.WAVE_SCROLL,
    SectionTags.CUES,
    SectionTags.CUES,
    SectionTags.CUES_2,
    SectionTags.CUES_2,
    SectionTags.WAVE_COLOR_SCROLL,
    SectionTags.WAVE_COLOR_PREVIEW,
  ]);

  // TODO: Would be nice to have tests for all sections
});
