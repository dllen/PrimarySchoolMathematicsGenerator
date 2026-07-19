import { addToLibrary, queryLibrary, removeFromLibrary } from '../db.js';

export function useProblemLibrary() {
  return {
    save: addToLibrary,
    query: queryLibrary,
    remove: removeFromLibrary,
  };
}