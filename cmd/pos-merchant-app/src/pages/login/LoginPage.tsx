// 登入頁面 - 遵循 SRP 原則，負責 PIN 碼認證

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { setUser } from '../../reducers/appReducer'
import type { RootState } from '../../types'

/**
 * 登入頁面組件
 */
const LoginPage: React.FC = () => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state: RootState) => state.app.isAuthenticated)

  // 預設 PIN 碼
  const DEFAULT_PIN = '1234'

  // 如果已登入，重定向到 POS 主頁面
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/pos')
    }
  }, [isAuthenticated, navigate])

  const handlePinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // 只允許數字輸入
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value)
      setError('')
    }
  }

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError('請輸入 4 位數 PIN 碼')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (pin === DEFAULT_PIN) {
        // 登入成功，設置用戶狀態
        dispatch(setUser({
          id: '1',
          name: '店員',
          email: 'staff@example.com',
        }))
        // 跳轉到 POS 主頁面
        navigate('/pos')
      } else {
        setError('PIN 碼錯誤，請重新輸入')
        setPin('')
      }
    } catch (err) {
      setError('登入失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              POS 系統登入
            </Typography>
            <Typography variant="body2" color="text.secondary">
              請輸入您的 PIN 碼
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              type="password"
              label="PIN 碼"
              value={pin}
              onChange={handlePinChange}
              onKeyPress={handleKeyPress}
              inputProps={{
                maxLength: 4,
                pattern: '[0-9]*',
                inputMode: 'numeric',
              }}
              error={!!error}
              helperText={error}
              disabled={loading}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  letterSpacing: '0.5rem',
                },
              }}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={loading || pin.length !== 4}
            sx={{
              height: 56,
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            {loading ? <CircularProgress size={24} /> : '登入'}
          </Button>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              測試 PIN 碼：
            </Typography>
            <Typography variant="body2" component="div">
              • 預設 PIN：1234
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginPage 