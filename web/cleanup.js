/* one-off: remove chapters whose work_id no longer exists (orphans) */
'use strict';
const db = require('./db');
const works = new Set(db.all('works').map((w) => w.id));
const chapters = db.all('chapters');
let removed = 0;
for (const c of chapters) {
  if (!works.has(c.work_id)) { db.remove('chapters', c.id); removed++; }
}
console.log(`cleanup: ${removed} orphan chapters removed (${chapters.length} -> ${db.all('chapters').length})`);
db.flush();
