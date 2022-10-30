/* eslint-disable @typescript-eslint/ban-ts-comment */

import {KaitaiStream} from 'kaitai-struct';

// eslint-ingore @typescript-eslint/ban-ts-comment
// NOTE: These files are built using `yarn build-parsers`. The update script
// will fetch the kaitai ksy files from crate-digger
//
// @ts-expect-error
import RekordboxAnlz from './RekordboxAnlz.js';
// @ts-expect-error
import RekordboxPdb from './RekordboxPdb.js';

/**
 * Parse a Rekordbox PDB database file
 */
function parsePdb(data: Buffer) {
  return new RekordboxPdb(new KaitaiStream(data));
}

/**
 * Parse a Rekordbox PDB database file
 */
function parseAnlz(data: Buffer) {
  return new RekordboxAnlz(new KaitaiStream(data));
}

/**
 * Utility generator that pages through a table and yields every present row.
 * This flattens the concept of rowGroups and refs.
 */
function* tableRows(table: any) {
  const {firstPage, lastPage} = table;

  let pageRef = firstPage;
  do {
    const page = pageRef.body;

    // Adjust our page ref for the next iteration. We do this early in our loop
    // so we can break without having to remember to update for the next iter.
    pageRef = page.nextPage;

    // Ignore non-data pages. Not sure what these are for?
    if (!page.isDataPage) {
      continue;
    }

    const rows = page.rowGroups
      .map((group: any) => group.rows)
      .flat()
      .filter((row: any) => row.present);

    for (const row of rows) {
      yield row.body;
    }
  } while (pageRef.index <= lastPage.index);
}

export {parseAnlz, parsePdb, RekordboxAnlz, RekordboxPdb, tableRows};
