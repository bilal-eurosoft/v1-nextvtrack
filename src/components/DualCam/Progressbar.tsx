import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <Box display="flex" alignItems="center" width="100%" >
      <Box width="100%" mr={1} >
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Box minWidth={35} >
        <Typography variant="body2" color="textSecondary">{`${progress}%`} </Typography>
      </Box>
    </Box>
  );
};

export default ProgressBar;
