const { getCollection } = require("../database");

const instructorsCache = [];
const coursesCache = [];

let cacheLoaded = false;

function setReferenceCacheData({ instructors, courses }) {
  if (!Array.isArray(instructors) || !Array.isArray(courses)) {
    throw new Error("setReferenceCacheData expects { instructors: [], courses: [] }");
  }

  instructorsCache.length = 0;
  coursesCache.length = 0;

  instructorsCache.push(...instructors);
  coursesCache.push(...courses);

  cacheLoaded = true;

  console.log(
    `[ReferenceCache] In-memory cache replaced (${instructorsCache.length} instructors, ${coursesCache.length} courses)`
  );
}

/**
 * Loads instructors & courses into memory from DB.
 * Safe to call multiple times.
 */
async function ensureReferenceCacheLoaded() {
  if (cacheLoaded) return;

  const instructors = getCollection("instructors");
  const courses = getCollection("courses");

  const instructorsData = await instructors.find({}).toArray();
  const coursesData = await courses.find({}).toArray();

  instructorsCache.length = 0;
  coursesCache.length = 0;

  instructorsCache.push(...instructorsData);
  coursesCache.push(...coursesData);

  cacheLoaded = true;

  console.log(
    `[ReferenceCache] Loaded ${instructorsCache.length} instructors, ${coursesCache.length} courses`
  );
}

/**
 * Persists current in-memory cache back to DB.
 */
async function persistReferenceCache() {
  const instructors = getCollection("instructors");
  const courses = getCollection("courses");

  await instructors.deleteMany({});
  await courses.deleteMany({});

  if (instructorsCache.length) {
    await instructors.insertMany(instructorsCache);
  }

  if (coursesCache.length) {
    await courses.insertMany(coursesCache);
  }

  console.log("[ReferenceCache] Cache persisted to database");
}

/**
 * Read-only cache accessors
 */
function getInstructors() {
  return instructorsCache;
}

function getCourses() {
  return coursesCache;
}

module.exports = {
  ensureReferenceCacheLoaded,
  persistReferenceCache,
  setReferenceCacheData,
  getInstructors,
  getCourses
};
