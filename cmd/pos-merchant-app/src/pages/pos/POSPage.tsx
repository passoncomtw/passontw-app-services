// POS 主頁面 - 遵循 SRP 原則，負責商品選擇和購物車管理

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  MenuItem as MenuItemComponent,
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../reducers/appReducer'
import { fetchProductsRequest } from '../../actions'
import { formatCurrency } from '../../utils/mockData'
import type { Product, CartItem, RootState } from '../../types'

/**
 * 商品卡片組件
 */
const ProductCard: React.FC<{
  product: Product
  onAddToCart: (product: Product) => void
}> = ({ product, onAddToCart }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 4,
        },
      }}
      onClick={() => onAddToCart(product)}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {formatCurrency(product.price)}
          </Typography>
          <Chip
            label={product.category === 'drink' ? '飲料' : '關東煮'}
            color={product.category === 'drink' ? 'primary' : 'secondary'}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  )
}

/**
 * 客製化選項對話框組件
 */
const CustomizationDialog: React.FC<{
  open: boolean
  product: Product | null
  onClose: () => void
  onConfirm: (customizations: { sugar?: string; ice?: string }) => void
}> = ({ open, product, onClose, onConfirm }) => {
  const [sugar, setSugar] = useState('')
  const [ice, setIce] = useState('')

  const handleConfirm = () => {
    onConfirm({ sugar, ice })
    setSugar('')
    setIce('')
    onClose()
  }

  const handleClose = () => {
    setSugar('')
    setIce('')
    onClose()
  }

  if (!product) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product.name} - 客製化選項</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {product.customizations?.map((customization) => (
            <FormControl key={customization.type} fullWidth sx={{ mb: 2 }}>
              <InputLabel>{customization.name}</InputLabel>
              <Select
                value={customization.type === 'sugar' ? sugar : ice}
                label={customization.name}
                onChange={(e) => {
                  if (customization.type === 'sugar') {
                    setSugar(e.target.value)
                  } else {
                    setIce(e.target.value)
                  }
                }}
              >
                {customization.options.map((option) => (
                  <MenuItem key={option.id} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleConfirm} variant="contained">
          加入購物車
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * POS 主頁面組件
 */
const POSPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'drink' | 'oden'>('drink')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customizationDialog, setCustomizationDialog] = useState<{
    open: boolean
    product: Product | null
  }>({ open: false, product: null })
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated, products, productsLoading } = useSelector(
    (state: RootState) => state.app
  )
  const hasFetchedRef = useRef(false)

  // 檢查登入狀態
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      hasFetchedRef.current = false
      return
    }

    // 避免在 React 18 StrictMode 下重複觸發（只在首次掛載後觸發一次）
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchProductsRequest())
    }
  }, [isAuthenticated, navigate, dispatch])

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

  // 篩選商品
  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.category === selectedCategory)
  }, [products, selectedCategory])

  // 計算購物車總額
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  }, [cart])

  // 處理商品加入購物車
  const handleAddToCart = (product: Product) => {
    if (product.customizations && product.customizations.length > 0) {
      // 有客製化選項，開啟對話框
      setCustomizationDialog({ open: true, product })
    } else {
      // 無客製化選項，直接加入購物車
      addToCart(product, {})
    }
  }

  // 加入購物車
  const addToCart = (product: Product, customizations: { sugar?: string; ice?: string }) => {
    const existingItem = cart.find(
      (item) =>
        item.product.id === product.id &&
        item.customizations.sugar === customizations.sugar &&
        item.customizations.ice === customizations.ice
    )

    if (existingItem) {
      // 更新數量
      setCart(
        cart.map((item) =>
          item === existingItem
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.product.price,
              }
            : item
        )
      )
    } else {
      // 新增項目
      const newItem: CartItem = {
        product,
        quantity: 1,
        customizations,
        totalPrice: product.price,
      }
      setCart([...cart, newItem])
    }
  }

  // 更新購物車項目數量
  const updateCartItemQuantity = (index: number, delta: number) => {
    const newCart = [...cart]
    const item = newCart[index]
    const newQuantity = item.quantity + delta

    if (newQuantity <= 0) {
      // 移除項目
      newCart.splice(index, 1)
    } else {
      // 更新數量
      newCart[index] = {
        ...item,
        quantity: newQuantity,
        totalPrice: newQuantity * item.product.price,
      }
    }

    setCart(newCart)
  }

  // 移除購物車項目
  const removeCartItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  // 處理結帳
  const handleCheckout = () => {
    if (cart.length === 0) return
    // 跳轉到結帳頁面，並傳遞購物車資料
    navigate('/checkout', { state: { cart } })
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 頂部導航 */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            POS 收銀系統
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/products')}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              商品管理
            </Button>
            
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
                <MenuItemComponent onClick={() => navigate('/products')}>
                  <SettingsIcon sx={{ mr: 1 }} />
                  商品管理
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
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* 主要內容區域 */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          {/* 分類切換 */}
          <Box sx={{ mb: 2 }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, newValue) => setSelectedCategory(newValue)}
              sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
            >
              <Tab label="飲料" value="drink" />
              <Tab label="關東煮" value="oden" />
            </Tabs>
          </Box>

          {/* 商品網格 */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {productsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">商品載入中...</Typography>
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">目前沒有商品</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                {filteredProducts.map((product) => (
                  <Box key={product.id}>
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* 購物車側邊欄 */}
        <Paper
          sx={{
            width: 400,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: 1,
            borderColor: 'divider',
          }}
        >
          {/* 購物車標題 */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <CartIcon sx={{ mr: 1 }} />
              購物車 ({cart.length})
            </Typography>
          </Box>

          {/* 購物車項目列表 */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {cart.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">購物車是空的</Typography>
              </Box>
            ) : (
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
                                {[
                                  item.customizations.sugar,
                                  item.customizations.ice,
                                ]
                                  .filter(Boolean)
                                  .join('、')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateCartItemQuantity(index, -1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateCartItemQuantity(index, 1)}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => removeCartItem(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* 購物車底部 */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">總計</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatCurrency(cartTotal)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              sx={{ height: 56, fontSize: '1.2rem', fontWeight: 'bold' }}
            >
              結帳
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* 客製化選項對話框 */}
      <CustomizationDialog
        open={customizationDialog.open}
        product={customizationDialog.product}
        onClose={() => setCustomizationDialog({ open: false, product: null })}
        onConfirm={(customizations) => {
          if (customizationDialog.product) {
            addToCart(customizationDialog.product, customizations)
          }
        }}
      />
    </Box>
  )
}

export default POSPage 