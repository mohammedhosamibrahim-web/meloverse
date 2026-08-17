/**
 * config.js — remote config: ads (banner/interstitial/rewarded) & access limits (free/VIP).
 * Served via GET /api/config — applied without app rebuilds.
 */
'use strict';
const db = require('./db');

const DEFAULTS = {
  version: 1,
  ads: {
    banner: { enabled: false, networkCode: '', position: 'reader-bottom' },
    interstitial: { enabled: false, frequencyPerChapters: 3, networkCode: '' },
    rewarded: { enabled: false, networkCode: '', unlockChapters: true },
  },
  access: {
    freeDailyDownloads: 20,
    vipsUnlimitedDownloads: true,
    freeDailyChapters: 100,
  },
  reader: {
    dataSaverDefault: true,
    imageProxyEnabled: true,
  },
};

function getConfig() {
  const stored = db.find('meta', (m) => m.id === 'config');
  if (!stored) {
    db.insert('meta', { id: 'config', value: DEFAULTS });
    return DEFAULTS;
  }
  return { ...DEFAULTS, ...stored.value, version: stored.value.version || 1 };
}

function updateConfig(patch) {
  const current = getConfig();
  const merged = {
    ...current,
    ...(patch.ads ? { ads: { ...current.ads, ...patch.ads } } : {}),
    ...(patch.access ? { access: { ...current.access, ...patch.access } } : {}),
    ...(patch.reader ? { reader: { ...current.reader, ...patch.reader } } : {}),
    version: (current.version || 1) + 1,
  };
  db.update('meta', 'config', { value: merged });
  return merged;
}

module.exports = { getConfig, updateConfig };
