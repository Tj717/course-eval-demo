import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchInstructors,
  fetchCourses,
  Instructor,
  Course,
} from '../utils/api';

// Structure of the object returned by the hook - Updated
export interface EvaluationFiltersHook {
  // Data for dropdowns (filtered based on selections)
  filteredInstructorOptions: Instructor[];
  filteredCourseOptions: Course[];
  availableTimes: string[]; // ** NEW: Filtered & Sorted Times (can be empty) **
  // Current Selections (Value)
  selectedInstructor: Instructor | null;
  selectedCourse: Course | null;
  fromTime: string;
  toTime: string;
  // State Setters
  setSelectedInstructor: React.Dispatch<React.SetStateAction<Instructor | null>>;
  setSelectedCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  setFromTime: React.Dispatch<React.SetStateAction<string>>;
  setToTime: React.Dispatch<React.SetStateAction<string>>;
  // Status Indicators
  areOptionsLoading: boolean;
  optionsError: string | null;
  // Actions
  handleClear: () => void;
}

export const useEvaluationFilters = (): EvaluationFiltersHook => {
  // --- State managed within the hook ---
  const [allInstructorsData, setAllInstructorsData] = useState<Instructor[]>([]);
  const [allCoursesData, setAllCoursesData] = useState<Course[]>([]);
  const [areOptionsLoading, setAreOptionsLoading] = useState<boolean>(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  // No longer need state for 'allSortedTimes'
  // const [allSortedTimes, setAllSortedTimes] = useState<string[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [fromTime, setFromTime] = useState<string>('');
  const [toTime, setToTime] = useState<string>('');

  // --- Effect for Initial Data Fetching (Instructors & Courses only) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setAreOptionsLoading(true);
      setOptionsError(null);
      setAllInstructorsData([]);
      setAllCoursesData([]);
      setSelectedInstructor(null);
      setSelectedCourse(null);
      setFromTime('');
      setToTime('');

      try {
        const [instructorsData, coursesData] = await Promise.all([
          fetchInstructors(),
          fetchCourses(),
        ]);

        const validInstructors = Array.isArray(instructorsData) ? instructorsData : [];
        const validCourses = Array.isArray(coursesData) ? coursesData : [];

        const sortedInstructors = [...validInstructors].sort((a, b) => a.instructor_name.localeCompare(b.instructor_name));
        const sortedCourses = [...validCourses].sort((a, b) => a.course_name.localeCompare(b.course_name));

        setAllInstructorsData(sortedInstructors);
        setAllCoursesData(sortedCourses);

      } catch (err) {
        let message = 'Failed to load filter options.';
        if (err instanceof Error) message = err.message;
        else if (typeof err === 'string') message = err;
        setOptionsError(message);
        setAllInstructorsData([]);
        setAllCoursesData([]);
      } finally {
        setAreOptionsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- Memoized Filtering Logic ---

  // Filter instructors based on selected course (logic remains same)
  const filteredInstructorOptions = useMemo(() => {
    if (!selectedCourse) return allInstructorsData;
    const courseDetail = allCoursesData.find(c => c.course_name === selectedCourse.course_name);
    const validInstructorNames = new Set(courseDetail?.instructors?.map(i => i.instructor_name) ?? []);
    return allInstructorsData.filter(instr => validInstructorNames.has(instr.instructor_name));
   }, [selectedCourse, allInstructorsData, allCoursesData]);

  // Filter courses based on selected instructor (logic remains same)
  const filteredCourseOptions = useMemo(() => {
     if (!selectedInstructor) return allCoursesData;
     const validCourseNames = new Set(selectedInstructor?.courses?.map(c => c.course_name) ?? []);
     return allCoursesData.filter(course => validCourseNames.has(course.course_name));
   }, [selectedInstructor, allCoursesData]);

  const availableTimes = useMemo(() => {
    // Only populate if BOTH instructor and course are selected
    if (selectedInstructor && selectedCourse) {
      // Find the specific course within the selected instructor's data
      const courseInfo = selectedInstructor.courses?.find(
        c => c.course_name === selectedCourse.course_name
      );

      // If found, get the times, sort them, otherwise return empty
      if (courseInfo && Array.isArray(courseInfo.times)) {
        // Sort chronologically
        return [...courseInfo.times].sort((a, b) => {
          const [yearA, termA] = a.split(' ');
          const [yearB, termB] = b.split(' ');
          if (yearA !== yearB) return yearA.localeCompare(yearB);
          type TermKey = 'S1' | 'W1' | 'W2';
          const termOrder: Record<TermKey, number> = { 'S1': 1, 'W1': 2, 'W2': 3 };
          return (termOrder[termA as TermKey] || 0) - (termOrder[termB as TermKey] || 0);
        });
      }
    }
    // If instructor or course is not selected, or times not found, return empty array
    return [];
  }, [selectedInstructor, selectedCourse]); // Depends only on the selections

  // --- Actions ---
  const handleClear = useCallback(() => {
      setSelectedInstructor(null);
      setSelectedCourse(null);
      setFromTime('');
      setToTime('');
  }, []);

  // --- Return Value ---
  return {
    // Filtered Data
    filteredInstructorOptions,
    filteredCourseOptions,
    availableTimes, // ** EXPOSE calculated times **
    // Current Selections
    selectedInstructor,
    selectedCourse,
    fromTime,
    toTime,
    // Setters
    setSelectedInstructor,
    setSelectedCourse,
    setFromTime,
    setToTime,
    // Status
    areOptionsLoading,
    optionsError,
    // Actions
    handleClear,
  };
};