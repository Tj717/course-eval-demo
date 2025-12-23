const { getCollection } = require("../database");
const { ObjectId } = require("mongodb");
const COLLECTION_NAME = process.env.EVAL_COLLECTION;

function cleanTabsAndIds(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanTabsAndIds);
  } else if (typeof obj === 'object' && obj !== null) {
    const cleaned = {};
    for (const key in obj) {
      const cleanKey = key.replace(/\t+/g, '').trim();
      let value = obj[key];

      if (value instanceof ObjectId) {
        cleaned[cleanKey] = value.toString();
      } else if (typeof value === 'string') {
        cleaned[cleanKey] = value.replace(/\t+/g, '').trim();
      } else if (Array.isArray(value) || typeof value === 'object') {
        cleaned[cleanKey] = cleanTabsAndIds(value);
      } else {
        cleaned[cleanKey] = value;
      }
    }
    return cleaned;
  }
  return obj;
}


exports.handleData = async (req, res) => {
  console.log('==== handleData endpoint called ====');
  const userData = req.body;
  const collection = getCollection(COLLECTION_NAME);

  // Check if the connection was successful before proceeding
  if (!collection) {
      console.error("Database connection not ready in handleData.");
      return res.status(503).json({ message: "Service Unavailable: Database not ready." });
  }

  // Debug: print DB and collection name
  console.log('DB Name:', collection.dbName);
  console.log('Collection Name:', collection.collectionName);

  // Print all documents in the collection
  const allDocs = await collection.find({}).toArray();
  console.log('All docs in evaluations:', allDocs);
  if (allDocs.length > 0) {
    console.log('First doc:', allDocs[0]);
  }

  function buildQuery(instructor, course, fromYear, fromTerm, toYear, toTerm) {
    const query = {};

    if (instructor) {
      query.Instructor = instructor;
    }

    if (course) {
      query.Course_Number = course;
    }

    const termOrder = { "S1": 1, "W1": 2, "W2": 3 };

    if (fromYear && fromTerm && toYear && toTerm) {
      const fromY = parseInt(fromYear, 10);
      const toY = parseInt(toYear, 10);
      if (fromY === toY) {
        query.$and = [
          { Year: fromY },
          { Term: { $gte: fromTerm, $lte: toTerm } },
        ];
      } else {
        query.$or = [
          { $and: [{ Year: fromY }, { Term: { $gte: fromTerm } }] },
          { Year: { $gt: fromY, $lt: toY } },
          { $and: [{ Year: toY }, { Term: { $lte: toTerm } }] },
        ];
      }
    } else if (fromYear && fromTerm) {
      const fromY = parseInt(fromYear, 10);
      query.$or = [
        { $and: [{ Year: fromY }, { Term: { $gte: fromTerm } }] },
        { Year: { $gt: fromY } },
      ];
    } else if (toYear && toTerm) {
      const toY = parseInt(toYear, 10);
      query.$or = [
        { $and: [{ Year: toY }, { Term: { $lte: toTerm } }] },
        { Year: { $lt: toY } },
      ];
    }
    console.log("Constructed Query:", JSON.stringify(query, null, 2)); 
    return query;
  }

  const query = buildQuery(
    userData.instructor,
    userData.course,
    userData.fromYear,
    userData.fromTerm,
    userData.toYear,
    userData.toTerm
  );

  // Debug: print the query object
  console.log('Query:', query);

  try {
    console.log("Attempting query with:", query);
    const results = await collection.find(query).toArray();
    // Debug: print the results
    console.log('Results:', results);
    console.log("Query Results Count:", results.length);
    const cleanedResults = cleanTabsAndIds(results);
    res.status(200).json(cleanedResults);  
    console.log("Query Results:", results);
  
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: "Failed to query data" });
  }
};

exports.test = async (req, res) => {
  const collection = getCollection(COLLECTION_NAME); // Call the getter

  if (!collection) {
      console.error("Database connection not ready in test.");
      // Respond with an error instead of just logging
      return res.status(503).json({ message: "Service Unavailable: Database not ready." });
  }

  try {
    const docCount = await collection.countDocuments({}); // Corrected variable name
    console.log(`Test route: Found ${docCount} documents.`);
    res.json({ count: docCount }); // Send a meaningful JSON response
  } catch (e) {
    console.error("Database test error:", e); // Log the specific error
    // Send an error response back to the client
    res.status(500).json({ message: "Failed to execute test query", error: e.message });
  }
};