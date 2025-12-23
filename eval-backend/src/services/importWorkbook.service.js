const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const { getCollection } = require("../database");
const {
  setReferenceCacheData,
  persistReferenceCache,
} = require("./referenceCache.service");

const DB_NAME = process.env.MONGO_DB_NAME;
const EVAL_COL = process.env.EVAL_COLLECTION || "evaluations";
const META_COL = process.env.PROCESSED_SHEETS_COLLECTION || "processed_sheets";

// data-process directory (assumed to live under src/data-process)
const scriptsDir = path.join(__dirname, "..", "data-process");

// Ensure data-process directory exists (dev safety)
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
  console.debug(`[ImportWorkbook] Created data-process directory at: ${scriptsDir}`);
}

/**
 * Cleans up uploaded files after processing
 */
async function cleanupFiles(filePaths) {
  if (!Array.isArray(filePaths)) return;

  for (const filePath of filePaths) {
    try {
      await fs.promises.unlink(filePath);
      console.debug(`[ImportWorkbook] Cleaned up file: ${filePath}`);
    } catch (err) {
      console.warn(`[ImportWorkbook] Failed to clean up file ${filePath}:`, err.message);
    }
  }
}

/**
 * Runs a Python script and returns its stdout trimmed.
 */
function runPythonScript(scriptName, args = []) {
  const scriptPath = path.join(scriptsDir, scriptName);

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python script not found: ${scriptPath}`);
  }

  return new Promise((resolve, reject) => {
    const py = spawn("python", ["-u", scriptPath, ...args], { cwd: scriptsDir });

    let out = "";
    let err = "";

    py.stdout.on("data", (chunk) => {
      out += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
      err += chunk.toString();
    });

    py.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Script ${scriptName} failed (${code}): ${err}`));
      }
      resolve(out.trim());
    });
  });
}

/**
 * Imports workbook(s):
 * 1) run excel2json.py
 * 2) insert new sheets into evaluations
 * 3) run instructor.py + course.py
 * 4) update in-memory reference cache + persist to DB
 * 5) cleanup uploads
 */
async function importWorkbook(excelPaths) {
  if (!Array.isArray(excelPaths) || excelPaths.length === 0) {
    throw new Error("importWorkbook expects a non-empty array of file paths");
  }

  console.log("[ImportWorkbook] Starting import for:", excelPaths);

  let jsonPath;

  try {
    // 1) Convert Excel → JSON
    jsonPath = await runPythonScript("excel2json.py", excelPaths);
    console.log("[ImportWorkbook] excel2json produced:", jsonPath);

    if (!jsonPath || !fs.existsSync(jsonPath)) {
      throw new Error(`Expected JSON not found: ${jsonPath}`);
    }

    let sheetsData;
    try {
      const raw = fs.readFileSync(jsonPath, "utf8");
      sheetsData = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Failed to parse JSON output (${jsonPath}): ${err.message}`);
    } finally {
      try {
        fs.unlinkSync(jsonPath);
      } catch (_) {}
    }

    // 2) Insert into Mongo (via centralized DB)
    const evalCol = getCollection(EVAL_COL);
    const metaCol = getCollection(META_COL);

    let totalInserted = 0;
    const processedSheets = [];

    for (const [sheetName, records] of Object.entries(sheetsData)) {
      const exists = await metaCol.findOne({ sheet: sheetName });
      if (exists) continue;

      if (!Array.isArray(records) || records.length === 0) {
        await metaCol.insertOne({ sheet: sheetName, processed_at: new Date() });
        continue;
      }

      const result = await evalCol.insertMany(records);
      totalInserted += result.insertedCount ?? records.length;

      processedSheets.push(sheetName);
      await metaCol.insertOne({ sheet: sheetName, processed_at: new Date() });
    }

    console.log(
      `[ImportWorkbook] Inserted ${totalInserted} records across ${processedSheets.length} new sheet(s)`
    );

    // 3) Generate instructors/courses JSON via python scripts
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not set");

    const outputDir = path.join(scriptsDir, "output");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const instrOut = await runPythonScript("instructor.py", [
      "--mongo-uri", mongoUri,
      "--db", DB_NAME,
      "--collection", EVAL_COL,
      "--output-dir", outputDir,
    ]);

    const courseOut = await runPythonScript("course.py", [
      "--mongo-uri", mongoUri,
      "--db", DB_NAME,
      "--collection", EVAL_COL,
      "--output-dir", outputDir,
    ]);

    // 4) Read generated JSON and update reference cache (service owns cache)
    const instructorsPath = path.join(outputDir, "instructors.json");
    const coursesPath = path.join(outputDir, "courses.json");

    if (!fs.existsSync(instructorsPath)) {
      throw new Error(`Missing generated instructors.json at ${instructorsPath}`);
    }
    if (!fs.existsSync(coursesPath)) {
      throw new Error(`Missing generated courses.json at ${coursesPath}`);
    }

    const instructorsData = JSON.parse(fs.readFileSync(instructorsPath, "utf8"));
    const coursesData = JSON.parse(fs.readFileSync(coursesPath, "utf8"));

    // clean temp files (best effort)
    try { fs.unlinkSync(instructorsPath); } catch (_) {}
    try { fs.unlinkSync(coursesPath); } catch (_) {}

    // Update in-memory cache + persist to DB via the cache service
    setReferenceCacheData({
      instructors: instructorsData,
      courses: coursesData,
    });

    await persistReferenceCache();

    console.log("[ImportWorkbook] Reference cache updated and persisted");

    return {
      inserted: totalInserted,
      processed_sheets: processedSheets,
      instructors_file: instrOut,
      courses_file: courseOut,
    };
  } finally {
    // Always cleanup uploaded Excel files (best effort)
    await cleanupFiles(excelPaths);
  }
}

module.exports = { importWorkbook };
