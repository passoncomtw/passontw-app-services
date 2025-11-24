import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Box,
  CircularProgress,
} from '@mui/material';
import { Add, Remove, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  increment, 
  decrement, 
  reset 
} from '../../reducers/counterReducer';
import { incrementAsync, decrementAsync } from '../../actions';

const Counter: React.FC = () => {
  const dispatch = useDispatch();
  const { value, loading } = useSelector((state: RootState) => state.counter);

  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrement = () => {
    dispatch(decrement());
  };

  const handleReset = () => {
    dispatch(reset());
  };

  const handleIncrementAsync = () => {
    dispatch(incrementAsync());
  };

  const handleDecrementAsync = () => {
    dispatch(decrementAsync());
  };

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom align="center">
          計數器
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Typography variant="h2" component="div" sx={{ mr: 2 }}>
            {value}
          </Typography>
          {loading && <CircularProgress size={24} />}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ButtonGroup variant="contained" fullWidth>
            <Button 
              onClick={handleDecrement} 
              startIcon={<Remove />}
              disabled={loading}
            >
              減少
            </Button>
            <Button 
              onClick={handleIncrement} 
              startIcon={<Add />}
              disabled={loading}
            >
              增加
            </Button>
          </ButtonGroup>

          <ButtonGroup variant="outlined" fullWidth>
            <Button 
              onClick={handleDecrementAsync} 
              disabled={loading}
            >
              異步減少
            </Button>
            <Button 
              onClick={handleIncrementAsync} 
              disabled={loading}
            >
              異步增加
            </Button>
          </ButtonGroup>

          <Button 
            variant="text" 
            onClick={handleReset} 
            startIcon={<Refresh />}
            disabled={loading}
            fullWidth
          >
            重置
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Counter;
