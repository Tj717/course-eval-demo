import React, { useState, useCallback } from 'react';
// MUI components for layout and buttons needed for the toggle
import { Button, ButtonGroup, Box } from '@mui/material';
import TrendForm from './TrendForm';
import TrendChart from './TrendChart';
import TrendTable from './TrendTable';
import './TrendPage.css'; // Your existing CSS import
import {
  fetchFilteredEvalData,
  EvalQueryParameters,
  EvalDataRecord,
} from '../../utils/api'; 
// Import the custom hook
import { useEvaluationFilters } from '../../hooks/useEvaluationFilters';

// parseTime helper function (preserved from your version)
const parseTime = (timeString: string | null | undefined): { year: string | null, term: string | null } => {
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(' ')) {
        return { year: null, term: null };
    }
    const parts = timeString.split(' ');
    if (parts.length === 2 && parts[0].length === 4 && (parts[1] === 'S1' || parts[1] === 'W1' || parts[1] === 'W2')) {
        return { year: parts[0], term: parts[1] };
    }
    return { year: null, term: null };
};

const TrendPage: React.FC = () => {
  const {
    filteredInstructorOptions, filteredCourseOptions, availableTimes,
    selectedInstructor, setSelectedInstructor, selectedCourse, setSelectedCourse,
    fromTime, setFromTime, toTime, setToTime,
    areOptionsLoading, optionsError,
    handleClear: clearSelections, 
  } = useEvaluationFilters();

  // --- State Specific to Search Results ---
  const [evaluationData, setEvaluationData] = useState<EvalDataRecord[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'chart' | 'rawData'>('chart');

  // --- Event Handlers ---
  // Handle search submission
  const handleSubmit = useCallback(async () => {
    const fromParts = parseTime(fromTime);
    const toParts = parseTime(toTime);
    const currentFilters: EvalQueryParameters = {
        instructor: selectedInstructor?.instructor_name ?? null,
        course: selectedCourse?.course_name ?? null,
        fromYear: fromParts.year,
        fromTerm: fromParts.term,
        toYear: toParts.year,
        toTerm: toParts.term,
    };
    // console.log('Filters constructed in TrendPage:', currentFilters);

    setIsSearchLoading(true);
    setSearchError(null);
    setEvaluationData([]);
    setViewMode('chart');
    // console.log('Filters being sent to API:', currentFilters);
    try {
        const data = await fetchFilteredEvalData(currentFilters);
        setEvaluationData(data);
    } catch (err) {
        console.error("API Error during search:", err);
        let message = 'Failed to fetch evaluation data.';
        if (err instanceof Error) message = err.message;
        else if (typeof err === 'string') message = err;
        setSearchError(message);
    } finally {
        setIsSearchLoading(false);
    }
  // Dependencies preserved from your version
  }, [selectedInstructor, selectedCourse, fromTime, toTime]);

  // Handle clearing selections AND results AND view mode
  const handleClear = useCallback(() => {
    clearSelections();    
    setEvaluationData([]);
    setSearchError(null); 
    setViewMode('chart'); 
  }, [clearSelections]); 

  return (
    <div className="trend-page-container">

      <div className="trend-form-container">
        <h1>Search Evaluation Data</h1>
        <TrendForm
          onSubmit={handleSubmit}
          onClear={handleClear}
          instructorOptions={filteredInstructorOptions}
          courseOptions={filteredCourseOptions}
          timeOptions={availableTimes}
          selectedInstructor={selectedInstructor}
          selectedCourse={selectedCourse}
          setSelectedInstructor={setSelectedInstructor}
          setSelectedCourse={setSelectedCourse}
          fromTime={fromTime} toTime={toTime}
          setFromTime={setFromTime} setToTime={setToTime}
          areOptionsLoading={areOptionsLoading} optionsError={optionsError}
        />
      </div>

      <div className="results-container">
        {isSearchLoading && <p>Loading search results...</p>}
        {searchError && <p style={{ color: 'red' }}>Search Error: {searchError}</p>}

        {!isSearchLoading && !searchError && (
          <Box sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '90%' } }}>
            <Box sx={{ flexGrow: 1, overflow: 'hidden', mb: 2, width: '100%' }}>
              {evaluationData.length > 0 ? (
                viewMode === 'chart' ? (
                  <TrendChart data={evaluationData} />
                ) : (
                  <TrendTable data={evaluationData} />
                )
              ) : (
                !areOptionsLoading && !optionsError && <p>No data found for the selected criteria.</p>
              )}
            </Box>

            {evaluationData.length > 0 && (
              <Box
                sx={{
                  position: { xs: 'static', md: 'fixed' },
                  alignSelf: { xs: 'flex-end', md: 'auto' },
                  mt: { xs: 2, md: 0 },
                  bottom: { md: '5vh' },
                  right: { md: '7vw' },
                  zIndex: 10,
                }}
              >
                <ButtonGroup variant="outlined" aria-label="View mode toggle button group" size="small">
                  <Button
                    onClick={() => setViewMode('chart')}
                    variant={viewMode === 'chart' ? 'contained' : 'outlined'}
                  >
                    Chart
                  </Button>
                  <Button
                    onClick={() => setViewMode('rawData')}
                    variant={viewMode === 'rawData' ? 'contained' : 'outlined'}
                  >
                    Raw Data
                  </Button>
                </ButtonGroup>
              </Box>
            )}
          </Box>
        )}
      </div>
    </div> 
  );
};

export default TrendPage;
