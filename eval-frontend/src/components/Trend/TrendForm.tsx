import React from 'react';
import { Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Box } from '@mui/material';
import { Instructor, Course } from '../../utils/types';

// Props interface matching exactly what TrendPage provides - UPDATED
interface TrendFormProps {
  onSubmit: () => void;
  onClear: () => void;
  instructorOptions: Instructor[];
  courseOptions: Course[];
  timeOptions: string[];
  selectedInstructor: Instructor | null;
  selectedCourse: Course | null;
  fromTime: string;
  toTime: string;
  setSelectedInstructor: (value: Instructor | null) => void;
  setSelectedCourse: (value: Course | null) => void;
  setFromTime: (value: string) => void;
  setToTime: (value: string) => void;
  areOptionsLoading: boolean;
  optionsError: string | null;
}

const TrendForm: React.FC<TrendFormProps> = ({
  onSubmit,
  onClear,
  instructorOptions,
  courseOptions,
  timeOptions, 
  selectedInstructor,
  selectedCourse,
  fromTime,
  toTime,
  setSelectedInstructor,
  setSelectedCourse,
  setFromTime,
  setToTime,
  areOptionsLoading,
  optionsError,
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (optionsError || areOptionsLoading) { return; }
    onSubmit();
  };

  // Display error passed from parent
  if (optionsError) {
    return <p style={{ color: 'red' }}>Error loading filter options: {optionsError}</p>;
  }

  // Determine if time selectors should be disabled
  const timeSelectDisabled = areOptionsLoading || timeOptions.length === 0;

  const rowSx = {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'stretch', sm: 'center' },
    gap: 1,
    width: '100%',
  };

  const labelSx = {
    width: { sm: '120px' },
    display: 'inline-block',
    fontSize: { xs: 14, sm: 16 },
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={rowSx}>
        <Box component="span" sx={labelSx}>Instructor:</Box>
        <Autocomplete
             disablePortal
             disabled={areOptionsLoading}
             id="instructor-autocomplete"
             options={instructorOptions}
             loading={areOptionsLoading}
             getOptionLabel={(option) => option.instructor_name}
             sx={{ flexGrow: 1, m: { xs: 0, sm: 1 } }}
             size="small"
             value={selectedInstructor}
             onChange={(_, newValue) => setSelectedInstructor(newValue)}
             renderInput={(params) => (
                 <TextField
                    {...params} label="Instructor"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {areOptionsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                 />
              )}
             isOptionEqualToValue={(option, value) => option?.instructor_name === value?.instructor_name} 
         />
      </Box>

      <Box sx={rowSx}>
         <Box component="span" sx={labelSx}>Course:</Box>
         <Autocomplete
              disablePortal
              disabled={areOptionsLoading}
              id="course-autocomplete"
              options={courseOptions}
              loading={areOptionsLoading}
              getOptionLabel={(option) => option.course_name}
              sx={{ flexGrow: 1, m: { xs: 0, sm: 1 } }}
              size="small"
              value={selectedCourse}
              onChange={(_, newValue) => setSelectedCourse(newValue)}
              renderInput={(params) => (
                  <TextField
                    {...params} label="Course"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {areOptionsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                  />
               )}
              isOptionEqualToValue={(option, value) => option?.course_name === value?.course_name}
          />
      </Box>

      <Box sx={rowSx}>
        <Box component="span" sx={labelSx}>From Term:</Box>
        <FormControl sx={{ flexGrow: 1, m: { xs: 0, sm: 1 } }} size="small" disabled={timeSelectDisabled}>
        <InputLabel id="from-label">(Optional)</InputLabel>
          <Select
            labelId="from-label" id="from" value={fromTime} label="Term"
            onChange={(e) => setFromTime(e.target.value)}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {timeOptions.map((time) => (
              <MenuItem key={time} value={time}>{time}</MenuItem>
            ))}
            {timeOptions.length === 0 && !areOptionsLoading && <MenuItem value="" disabled>Select Instructor & Course</MenuItem>}
            {areOptionsLoading && <MenuItem value="" disabled>Loading...</MenuItem>}
          </Select>
        </FormControl>
      </Box>

      <Box sx={rowSx}>
        <Box component="span" sx={labelSx}>To Term:</Box>
        <FormControl sx={{ flexGrow: 1, m: { xs: 0, sm: 1 } }} size="small" disabled={timeSelectDisabled}>
          <InputLabel id="to-label">(Optional)</InputLabel>
          <Select
            labelId="to-label" id="to" value={toTime} label="Term"
            onChange={(e) => setToTime(e.target.value)}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {timeOptions.map((time) => (
              <MenuItem key={time} value={time}>{time}</MenuItem>
            ))}
            {timeOptions.length === 0 && !areOptionsLoading && <MenuItem value="" disabled>Select Instructor & Course</MenuItem>}
            {areOptionsLoading && <MenuItem value="" disabled>Loading...</MenuItem>}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mt: 3, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClear} size="medium" disabled={areOptionsLoading} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Clear
        </Button>
        <Button variant="contained" type="submit" size="medium" disabled={areOptionsLoading || !selectedInstructor || !selectedCourse} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Submit
        </Button>
      </Box>
    </form>
  );
};

export default TrendForm;
