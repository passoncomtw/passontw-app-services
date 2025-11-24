import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  severity = 'error',
  onClose,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity={severity} onClose={onClose}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
