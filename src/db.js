
import Dexie from 'dexie';

// 1. Create and configure the database
export const db = new Dexie('MathProblemsHistory');
db.version(1).stores({
  problemSets: '++id, timestamp', // Primary key auto-increments, index timestamp for sorting
});

// 2. Format timestamp helper function
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

// 3. Add a new problem set and manage history limit
export async function addProblemSet(problems, config) {
  try {
    // Add the new set
    await db.problemSets.add({
      timestamp: getFormattedTimestamp(),
      config: config,
      problems: problems,
    });

    // Check the count and enforce the 20-record limit
    const count = await db.problemSets.count();
    if (count > 20) {
      // If count is over 20, find the oldest record and delete it
      const oldest = await db.problemSets.orderBy('id').first();
      if (oldest) {
        await db.problemSets.delete(oldest.id);
      }
    }
  } catch (error) {
    console.error("Failed to add or prune problem sets:", error);
  }
}

// 4. Retrieve all historical problem sets, sorted by newest first
export async function getHistory() {
  try {
    // Order by 'id' in reverse to get newest first, as 'id' is auto-incrementing
    return await db.problemSets.orderBy('id').reverse().toArray();
  } catch (error) {
    console.error("Failed to get history:", error);
    return []; // Return an empty array on failure
  }
}
