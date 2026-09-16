import { readFileSync } from 'node:fs';
import { reopenedFinalPolish } from './final-polish-scope.mjs';
export const ownerFeedback = JSON.parse(readFileSync(new URL('../../internal/owner-feedback-20260916.json', import.meta.url)));
// Owner's eight-point request explicitly reopens these surfaces. Historical hashes stay intact.
// The new regression suite checks all untouched files and exact phrase/dimension-only edits.
export const reopenedOwnerFeedback = new Set([...ownerFeedback.editable, ...ownerFeedback.phraseOnly, ...ownerFeedback.dimensionsOnly, ...reopenedFinalPolish]);
