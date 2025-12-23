import React from 'react';
import { EvalDataRecord } from '../../utils/types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

interface TrendTableProps {
  data: EvalDataRecord[];
}

const excludedFields = [
  '_id',
  'Course_ID',
  'Course_Number',
  'Instructor',
  'Term_Number',
  'Year',
  ''
];

const sortTimeLabels = (a: string, b: string): number => {
    const [yearA, termA] = a.split(' ');
    const [yearB, termB] = b.split(' ');
  
    if (!yearA || !termA || !yearB || !termB) return 0;
  
    if (yearA !== yearB) {
      return yearA.localeCompare(yearB);
    }
  
    type TermKey = 'S1' | 'W1' | 'W2';
    const termOrder: Record<TermKey, number> = { 'S1': 1, 'W1': 2, 'W2': 3 };
  
    return (termOrder[termA as TermKey] || 0) - (termOrder[termB as TermKey] || 0);
};
  
const TrendTable: React.FC<TrendTableProps> = ({ data }) => {
  if (!data || data.length === 0) return <p>No data to display.</p>;

  const rawKeys = Object.keys(data[0]).filter(
    (key) => !excludedFields.includes(key)
  );

  // Move "Average" below "Term_Average" if both exist
  const visibleKeys: string[] = (() => {
    const keys = rawKeys.filter((k) => k !== 'Average');
    const termIndex = keys.indexOf('Term_Average');
    if (termIndex !== -1 && rawKeys.includes('Average')) {
      keys.splice(termIndex + 1, 0, 'Average');
    } else if (rawKeys.includes('Average')) {
      keys.push('Average');
    }
    return keys;
  })();

  const getRecordLabel = (record: EvalDataRecord): string => {
    const year = record.Year ?? 'Unknown';
    const term = record.Term ?? 'Unknown';
    return `${year} ${term}`;
  };

  const getRowColor = (key: string): string | undefined => {
    if (key === 'Term_Average') return '#5a6fa1';
    if (key === 'Average')      return '#2E7D32';
    return undefined;
  };
  
  const sortedData = [...data].sort((a, b) => {
    const labelA = `${a.Year ?? ''} ${a.Term ?? ''}`;
    const labelB = `${b.Year ?? ''} ${b.Term ?? ''}`;
    return sortTimeLabels(labelA, labelB);
  });

  // for wrapped texts
  // const truncate = (text: string, maxLength = 20): string =>
  //   text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  
  return (
    <TableContainer component={Paper} sx={{ maxHeight: { xs: 360, sm: 600 }, overflowX: 'auto', border: '1px solid #ccc',
        borderRadius: 2,     '&::-webkit-scrollbar': {
          width: '20px',    // vertical scrollbar width
          height: '20px',   // horizontal scrollbar height
        },
        '&::-webkit-scrollbar-track': {
          background: '#f0f0f0',
          borderRadius: '18px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#b0b0b0',
          borderRadius: '18px',
          border: '4px solid #f0f0f0'
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#295851',
        } }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 14 }, p: { xs: 1, sm: 1.5 } }}>Field</TableCell>
            {sortedData.map((record, colIndex) => (
              <TableCell key={colIndex} sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 16 }, p: { xs: 1, sm: 1.5 } }}>
                {getRecordLabel(record)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleKeys.map((key) => {
            const bgColor = getRowColor(key);
            return (
              <TableRow key={key} sx={bgColor ? { backgroundColor: bgColor } : {}}>
                <TableCell sx={{ fontWeight: 500, fontSize: { xs: 12, sm: 16 }, p: { xs: 1, sm: 1.5 } }}>
                    {key}
                </TableCell>
                {sortedData.map((record, colIndex) => (
                  <TableCell key={colIndex} sx={{ fontSize: { xs: 12, sm: 14 }, p: { xs: 1, sm: 1.5 } }}>
                    {record[key] !== undefined && record[key] !== null
                      ? String(record[key])
                      : ''}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TrendTable;
