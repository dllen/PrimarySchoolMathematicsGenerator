import Dexie from 'dexie';

export const db = new Dexie('MathProblemsHistory');

db.version(1).stores({
  problemSets: '++id, timestamp',
});

db.version(2).stores({
  problemSets: '++id, timestamp',
  problemLibrary: '++id, [grade+semester+type], type, grade, semester, difficulty, *knowledgePoints',
});

function getFormattedTimestamp() {
  const date = new Date();
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}

export async function addProblemSet(problems, config) {
  try {
    await db.problemSets.add({
      timestamp: getFormattedTimestamp(),
      config: JSON.parse(JSON.stringify(config)),
      problems: JSON.parse(JSON.stringify(problems)),
    });
    const count = await db.problemSets.count();
    if (count > 20) {
      const oldest = await db.problemSets.orderBy('timestamp').first();
      if (oldest) await db.problemSets.delete(oldest.id);
    }
  } catch (error) {
    console.error('Failed to add or prune problem sets:', error);
  }
}

export async function getHistory() {
  try {
    return await db.problemSets.orderBy('timestamp').reverse().toArray();
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

export async function addToLibrary(partial) {
  return await db.problemLibrary.add({
    createdAt: getFormattedTimestamp(),
    ...partial,
  });
}

export async function getFromLibrary(id) {
  return await db.problemLibrary.get(id);
}

export async function queryLibrary({ grade, semester, type, difficulty, knowledgePoints }) {
  let collection = db.problemLibrary
    .where('[grade+semester+type]')
    .equals([grade, semester, type]);

  if (difficulty !== undefined) {
    collection = collection.and((p) => p.difficulty === difficulty);
  }
  if (Array.isArray(knowledgePoints) && knowledgePoints.length > 0) {
    collection = collection.and((p) =>
      knowledgePoints.every((kp) => p.knowledgePoints.includes(kp))
    );
  }

  return await collection.toArray();
}

export async function removeFromLibrary(id) {
  return await db.problemLibrary.delete(id);
}