// 結帳頁面 - 遵循 SRP 原則，負責結帳流程和找零計算

import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../../reducers/appReducer'
import { formatCurrency, formatDate } from '../../utils/mockData'
import type { CartItem, Order, RootState } from '../../types'

/**
 * 收據預覽組件
 */
const ReceiptPreview: React.FC<{
  order: Order
  onClose: () => void
}> = ({ order, onClose }) => {
  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptIcon />
        收據預覽
      </DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              美味關東煮店
            </Typography>
            <Typography variant="body2" color="text.secondary">
              台北市信義區信義路五段7號
            </Typography>
            <Typography variant="body2" color="text.secondary">
              電話：02-1234-5678
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            交易時間：{formatDate(order.createdAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            訂單編號：{order.id}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {/* 商品明細 */}
          {order.items.map((item, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {item.product.name}
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(item.product.price)}
                </Typography>
              </Box>
              {(item.customizations.sugar || item.customizations.ice) && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  {[item.customizations.sugar, item.customizations.ice]
                    .filter(Boolean)
                    .join('、')}
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  數量：{item.quantity}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  小計：{formatCurrency(item.totalPrice)}
                </Typography>
              </Box>
            </Box>
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          {/* 總計 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">總計</Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatCurrency(order.totalAmount)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">實收金額</Typography>
            <Typography variant="body2">
              {formatCurrency(order.cashReceived)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">找零</Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatCurrency(order.change)}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              謝謝您的惠顧！
            </Typography>
            <Typography variant="body2" color="text.secondary">
              歡迎再次光臨
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>關閉</Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => {
            // 這裡可以整合印表機功能
            alert('列印功能將在後續整合')
            onClose()
          }}
        >
          列印收據
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * 結帳頁面組件
 */
const CheckoutPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cart: CartItem[] = location.state?.cart || []
  const user = useSelector((state: RootState) => state.app.user)
  const isAuthenticated = useSelector((state: RootState) => state.app.isAuthenticated)
  
  const [cashReceived, setCashReceived] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)

  // 檢查登入狀態
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // 處理登出
  const handleLogout = () => {
    dispatch(logout())
    setUserMenuAnchor(null)
    navigate('/login')
  }

  // 處理用戶選單
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  // 計算總額
  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  }, [cart])

  // 計算找零
  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0
    return Math.max(0, received - totalAmount)
  }, [cashReceived, totalAmount])

  // 處理結帳
  const handleCheckout = () => {
    const received = parseFloat(cashReceived)
    if (!received || received < totalAmount) {
      alert('請輸入足夠的現金金額')
      return
    }

    // 建立訂單
    const newOrder: Order = {
      id: `ORDER-${Date.now()}`,
      items: cart,
      totalAmount,
      cashReceived: received,
      change,
      createdAt: new Date().toISOString(),
    }

    setOrder(newOrder)
    setShowReceipt(true)
  }

  // 處理完成結帳
  const handleComplete = () => {
    setShowReceipt(false)
    setOrder(null)
    setCashReceived('')
    // 跳轉回 POS 主頁面
    navigate('/pos')
  }

  // 如果沒有購物車資料，跳轉回 POS 頁面
  if (cart.length === 0) {
    navigate('/pos')
    return null
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 頂部導航 */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              onClick={() => navigate('/pos')}
              sx={{ color: 'white' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">
              結帳
            </Typography>
          </Box>
          
          {/* 用戶選單 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {user?.name || '店員'}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              sx={{ color: 'white' }}
            >
              <AccountIcon />
            </IconButton>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItemComponent onClick={() => navigate('/pos')}>
                <ArrowBackIcon sx={{ mr: 1 }} />
                返回收銀
              </MenuItemComponent>
              <Divider />
              <MenuItemComponent onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                登出
              </MenuItemComponent>
            </Menu>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* 左側：訂單明細 */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            訂單明細
          </Typography>
          
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <List>
                {cart.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={item.product.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {formatCurrency(item.product.price)} × {item.quantity}
                            </Typography>
                            {(item.customizations.sugar || item.customizations.ice) && (
                              <Typography variant="caption" color="text.secondary">
                                {[item.customizations.sugar, item.customizations.ice]
                                  .filter(Boolean)
                                  .join('、')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(item.totalPrice)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < cart.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* 右側：結帳控制 */}
        <Paper
          sx={{
            width: 400,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">結帳資訊</Typography>
          </Box>

          <Box sx={{ p: 2, flexGrow: 1 }}>
            {/* 總額顯示 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                總計：{formatCurrency(totalAmount)}
              </Typography>
            </Box>

            {/* 現金輸入 */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="實收金額"
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>NT$</Typography>,
                }}
                sx={{ mb: 2 }}
              />
              
              {/* 找零顯示 */}
              {cashReceived && (
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    找零：{formatCurrency(change)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* 快速金額按鈕 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                快速金額
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {[100, 200, 500, 1000, 2000, 5000].map((amount) => (
                  <Button
                    key={amount}
                    variant="outlined"
                    size="small"
                    onClick={() => setCashReceived(amount.toString())}
                    sx={{ height: 40 }}
                  >
                    {amount}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>

          {/* 結帳按鈕 */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!cashReceived || parseFloat(cashReceived) < totalAmount}
              onClick={handleCheckout}
              sx={{ height: 56, fontSize: '1.2rem', fontWeight: 'bold' }}
            >
              完成結帳
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* 收據預覽對話框 */}
      {showReceipt && order && (
        <ReceiptPreview
          order={order}
          onClose={handleComplete}
        />
      )}
    </Box>
  )
}

export default CheckoutPage 