import React, { useMemo, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps, Legend, ResponsiveContainer
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { FormControlLabel, Switch, Typography, Box, Paper, Stack } from '@mui/material';
import { EvalDataRecord } from '../../utils/types';

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
const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload as ProcessedChartData;
        return (
            <Paper elevation={3} sx={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>{label}</Typography>
                {payload.map((entry, index) => (
                    <Box key={`item-${index}`} sx={{ color: entry.color, mb: 0.5 }}>
                        <Typography variant="body2" component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ marginRight: '10px' }}>{entry.name}:</span>
                            <span>
                                {typeof entry.value === 'number'
                                    ? entry.value.toFixed(2)
                                    : (entry.value ?? 'N/A')
                                }
                            </span>
                        </Typography>
                        {entry.name === 'Course Average' && dataPoint.surveyInfoString && (
                            <Typography variant="caption" component="div" sx={{ pl: 1, color: 'text.secondary' }}>
                                Survey Responses: {dataPoint.surveyInfoString}
                            </Typography>
                        )}
                        {entry.name === 'Term Average' && ( <></> )}
                    </Box>
                ))}
            </Paper>
        );
    }
    return null;
};

interface ProcessedChartData {
    timeLabel: string;
    Average?: number | null;
    Term_Average?: number | null;
    surveyInfoString?: string | null;
}

interface TrendChartProps {
    data: EvalDataRecord[];
}


const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    const [showTermAverage, setShowTermAverage] = useState(true);
    const [isDynamicDomain, setIsDynamicDomain] = useState(true);

    // Processed Data Calculation (remains the same)
    const processedChartData: ProcessedChartData[] = useMemo(() => {
        // ... (data processing logic)
        if (!Array.isArray(data)) return [];

        const mappedData = data.map(record => {
            const avgValue = typeof record.Average === 'number' ? record.Average : null;
            const termAvgValue = typeof record.Term_Average === 'number' ? record.Term_Average : null;
            const surveyInfo = record["Survey Responses (Total Respondents/Total Number of Students)"];
            const surveyInfoStringValue = typeof surveyInfo === 'string' && surveyInfo.trim() !== '' ? surveyInfo : null;

            const year = record.Year;
            const term = record.Term;
            const timeLabel = (year != null && term != null && String(term).trim() !== '')
                ? `${year} ${term}`
                : 'Unknown Time';

            return {
                timeLabel: timeLabel,
                Average: avgValue,
                Term_Average: termAvgValue,
                surveyInfoString: surveyInfoStringValue,
            };
        });

        mappedData.sort((a, b) => sortTimeLabels(a.timeLabel, b.timeLabel));
        return mappedData;
    }, [data]);

    const hasTermAverageData = useMemo(() => {
         return processedChartData.some(d =>
            d.Term_Average !== null && d.Term_Average !== undefined
        );
    }, [processedChartData]);

    // Y-Axis Domain Calculation (remains the same)
    const yAxisDomain = useMemo<[number | string, number | string]>(() => {
        if (!isDynamicDomain) {
            return [0, 5]; // Static domain
        }
        // Dynamic calculation
        let minVal = Infinity;
        processedChartData.forEach(point => {
             if (typeof point.Average === 'number') { minVal = Math.min(minVal, point.Average); }
             if (showTermAverage && typeof point.Term_Average === 'number') { minVal = Math.min(minVal, point.Term_Average); }
        });
        if (minVal === Infinity) { return [0, 5]; } // Fallback if no data
        const lowerBoundPadding = 0.2;
        const calculatedMin = minVal - lowerBoundPadding;
        const domainMin = Math.max(0, calculatedMin);
        const domainMax = 5;
        return [domainMin, domainMax];
    }, [processedChartData, showTermAverage, isDynamicDomain]);

    // --- START: Conditional Y-Axis Ticks ---
    const staticTicks = [0, 1, 2, 3, 4, 5];
    // Set ticks explicitly ONLY when using the static domain, otherwise let Recharts decide
    const yAxisTicks = !isDynamicDomain ? staticTicks : undefined;
    // --- END: Conditional Y-Axis Ticks ---

    // Handlers (remain the same)
    const handleToggleTermAverage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowTermAverage(event.target.checked);
    };
    const handleDomainToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsDynamicDomain(event.target.checked); // true = Fit to Data ON (dynamic), false = Fit to Data OFF (static)
    };

    return (
        <Box sx={{ width: '100%', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1 }}>
            <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                Evaluation Averages Trend
            </Typography>

             {/* Control Toggles Area */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="flex-end"
                alignItems="center"
                sx={{ width: '100%', mb: 1, pr: { sm: 4 } }}
            >
                 <FormControlLabel
                    // Note: If isDynamicDomain=true means "Fit to Data" is ON, the label might be clearer this way
                    control={<Switch checked={isDynamicDomain} onChange={handleDomainToggle} size="small" />}
                    label="Fit to Data" // Changed label for clarity
                />
                {hasTermAverageData && (
                    <FormControlLabel
                        control={<Switch checked={showTermAverage} onChange={handleToggleTermAverage} size="small" />}
                        label="Show Term Average"
                    />
                )}
            </Stack>

            {/* Chart Container */}
            <Box sx={{ width: '100%', height: { xs: 300, sm: 380, md: 450 } }}>
                <ResponsiveContainer width="100%" height="100%">
                    {processedChartData.length > 0 ? (
                        <LineChart
                            data={processedChartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                            <XAxis
                                dataKey="timeLabel"
                                angle={-30} textAnchor="end" interval={0} stroke="#666"
                                padding={{ left: 15, right: 15 }}
                            />
                            <YAxis
                                domain={yAxisDomain}
                                ticks={yAxisTicks} 
                                allowDataOverflow={false}
                                stroke="#666"
                                width={40}
                                tickFormatter={(tick) => {
                                    if (!isDynamicDomain) {
                                        return typeof tick === 'number' ? tick.toString() : '';
                                    }
                                    return typeof tick === 'number' ? tick.toFixed(1) : tick;
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36}/>
                            <Line type="linear" dataKey="Average" stroke="#8884d8" strokeWidth={3} name="Course Average" connectNulls dot={{ r: 3 }} activeDot={{ r: 6 }} />
                            {showTermAverage && hasTermAverageData && (
                                <Line type="linear" dataKey="Term_Average" stroke="#295851" strokeWidth={3} name="Term Average" connectNulls dot={{ r: 3 }} activeDot={{ r: 6 }} />
                            )}
                        </LineChart>
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 4 }}>No chart data available.</Typography>
                    )}
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default TrendChart;
