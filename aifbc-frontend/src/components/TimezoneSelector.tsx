import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { COMMON_TIMEZONES } from '../utils';

interface TimezoneSelectorProps {
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  onMessage: (
    text: string,
    type: 'info' | 'success' | 'warning' | 'danger'
  ) => void;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  timezone,
  onTimezoneChange,
  onMessage,
}) => {
  const handleTimezoneChange = (newTimezone: string) => {
    onTimezoneChange(newTimezone);
    onMessage(`Timezone changed to ${newTimezone}`, 'info');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
        Timezone
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Select Timezone</InputLabel>
        <Select
          value={timezone}
          label="Select Timezone"
          onChange={e => handleTimezoneChange(e.target.value)}
        >
          {COMMON_TIMEZONES.map(tz => (
            <MenuItem key={tz.value} value={tz.value}>
              {tz.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TimezoneSelector;
