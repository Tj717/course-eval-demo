import { authFetch } from '../utils/auth';

// --- Type Definitions ---

/**
 * Holds information about a single course taught by an instructor,
 * including the course's name and the list of term identifiers.
 */
export interface InstructorCourseInfo {
  course_name: string;
  times: string[]; 
}

/**
 * Represents an instructor and the courses they teach.
 */
export interface Instructor {
  instructor_name: string;
  courses: InstructorCourseInfo[];
}

/**
 * Holds information about a single instructor of a course,
 * including the instructor's name and the terms they taught.
 */
export interface CourseInstructorInfo {
  instructor_name: string;
  times: string[];
}

/**
 * Represents a course and the instructors teaching it.
 */
export interface Course {
  course_name: string;
  instructors: CourseInstructorInfo[];
}

/**
 * A single evaluation record returned from the backend.
 */
export interface EvalDataRecord {
  _id: string;
  instructor: string;
  course: string;
  Year: number;
  Term: string;
  [key: string]: string | number;
}

/**
 * Query filters sent to the backend to fetch evaluation data.
 */
export interface EvalQueryParameters {
  instructor?: string | null;
  course?: string | null;
  fromYear?: string | null;
  fromTerm?: string | null;
  toYear?: string | null;
  toTerm?: string | null;
}

export interface TrendData {
  instructor?: string;
  course?: string;
  fromYear?: string;
  fromTerm?: string;
  toYear?: string;
  toTerm?: string;
}

// --- API Fetch Functions ---

/**
 * Fetches the list of courses (with nested instructors) from the API.
 * @returns Promise resolving to an array of Course objects.
 */
export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const response = await authFetch('/api/courses');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json() as Course[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch courses: ${message}`);
  }
};

/**
 * Fetches the list of instructors (with nested courses) from the API.
 * @returns Promise resolving to an array of Instructor objects.
 */
export const fetchInstructors = async (): Promise<Instructor[]> => {
  try {
    const response = await authFetch('/api/instructors');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json() as Instructor[];
  } catch (error) {
    console.error('Error fetching instructors:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch instructors: ${message}`);
  }
};

/**
 * Sends a POST to /api/trend with provided payload and returns the response.
 * @param formData Payload for trend analysis
 * @returns Parsed JSON response from the trend endpoint
 */
export const fetchTrendData = async (formData: TrendData): Promise<EvalDataRecord[]> => {
  try {
    const response = await authFetch('/api/trend', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching trend data:', error);
    throw error;
  }
};

/**
 * Fetches filtered evaluation records based on user-specified filters.
 * @param filters Query parameters for instructor, course, and term ranges
 * @returns Promise resolving to an array of EvalDataRecord
 */
export const fetchFilteredEvalData = async (
  filters: EvalQueryParameters
): Promise<EvalDataRecord[]> => {
  try {
    const response = await authFetch('/api/send-query', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson.message || `HTTP error! Status: ${response.status}`;
      throw new Error(msg);
    }
    const data = await response.json() as EvalDataRecord[];
    console.log('Filtered data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching filtered evaluation data:', error);
    throw error;
  }
};

/**
 * Uploads one or more Excel workbooks to the server.
 * @param files Array of File objects to upload
 */
export const uploadWorkbooks = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const response = await authFetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const msg = errJson.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }
};
