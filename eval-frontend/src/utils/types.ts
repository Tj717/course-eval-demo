// src/types.ts (or your preferred location)

// Structure for Course info nested within Instructor data
export interface InstructorCourseInfo {
  course_name: string;
  times: string[];
}

// Structure for Instructor data (including nested courses)
export interface Instructor {
  instructor_name: string;
  courses: InstructorCourseInfo[];
}

// Structure for Instructor info nested within Course data (ASSUMED structure)
export interface CourseInstructorInfo {
  instructor_name: string;
  times: string[];
}

// Structure for Course data (including nested instructors - ASSUMED structure)
export interface Course {
  course_name: string;
  instructors: CourseInstructorInfo[];
}

// Structure for a single evaluation data record returned by search
export interface EvalDataRecord {
  _id: string;
  instructor: string;
  course: string;
  Year: number;
  Term: string;
  [key: string]: string | number;
}

// Structure for filter parameters sent TO the backend search/query endpoint
export interface EvalQueryParameters {
  instructor?: string | null;
  course?: string | null;
  fromYear?: string | null;
  fromTerm?: string | null;
  toYear?: string | null;
  toTerm?: string | null;
}
