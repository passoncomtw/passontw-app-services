// 商品管理頁面 - 遵循 SRP 原則，負責商品列表管理

import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  IconButton,
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
  Divider,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../reducers/appReducer'
import { MOCK_PRODUCTS, formatCurrency } from '../../utils/mockData'
import type { Product, RootState } from '../../types'

/**
 * 商品卡片組件
 */
const ProductCard: React.FC<{
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}> = ({ product, onEdit, onDelete }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={() => onEdit(product)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(product)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {formatCurrency(product.price)}
          </Typography>
          <Chip
            label={product.category === 'drink' ? '飲料' : '關東煮'}
            color={product.category === 'drink' ? 'primary' : 'secondary'}
            size="small"
          />
        </Box>
        
        {product.customizations && product.customizations.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              客製化選項：
            </Typography>
            {product.customizations.map((customization) => (
              <Chip
                key={customization.type}
                label={customization.name}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 商品編輯對話框組件
 */
const ProductEditDialog: React.FC<{
  open: boolean
  product: Product | null
  onClose: () => void
  onSave: (product: Product) => void
}> = ({ open, product, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Product>>({})

  React.useEffect(() => {
    if (product) {
      setFormData(product)
    } else {
      setFormData({
        name: '',
        category: 'drink',
        price: 0,
        description: '',
      })
    }
  }, [product])

  const handleSave = () => {
    if (formData.name && formData.price) {
      const updatedProduct: Product = {
        id: product?.id || `product-${Date.now()}`,
        name: formData.name,
        category: formData.category as 'drink' | 'oden',
        price: formData.price,
        description: formData.description || '',
        customizations: formData.customizations,
      }
      onSave(updatedProduct)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{product ? '編輯商品' : '新增商品'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="商品名稱"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <FormControl fullWidth>
            <InputLabel>分類</InputLabel>
            <Select
              value={formData.category || 'drink'}
              label="分類"
              onChange={(e) => setFormData({ ...formData, category: e.target.value as 'drink' | 'oden' })}
            >
              <MenuItem value="drink">飲料</MenuItem>
              <MenuItem value="oden">關東煮</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="價格"
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            InputProps={{
              startAdornment: <InputAdornment position="start">NT$</InputAdornment>,
            }}
          />
          
          <TextField
            fullWidth
            label="描述"
            multiline
            rows={3}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSave} variant="contained">
          儲存
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * 商品管理頁面組件
 */
const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'drink' | 'oden'>('all')
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    product: Product | null
  }>({ open: false, product: null })
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.app.user)
  const isAuthenticated = useSelector((state: RootState) => state.app.isAuthenticated)

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

  // 篩選商品
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  // 處理編輯商品
  const handleEdit = (product: Product) => {
    setEditDialog({ open: true, product })
  }

  // 處理刪除商品
  const handleDelete = (product: Product) => {
    if (window.confirm(`確定要刪除商品「${product.name}」嗎？`)) {
      setProducts(products.filter((p) => p.id !== product.id))
    }
  }

  // 處理儲存商品
  const handleSave = (updatedProduct: Product) => {
    const existingIndex = products.findIndex((p) => p.id === updatedProduct.id)
    if (existingIndex >= 0) {
      // 更新現有商品
      const newProducts = [...products]
      newProducts[existingIndex] = updatedProduct
      setProducts(newProducts)
    } else {
      // 新增商品
      setProducts([...products, updatedProduct])
    }
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
              商品管理
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setEditDialog({ open: true, product: null })}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              新增商品
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
      </Box>

      {/* 篩選控制項 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="搜尋商品..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>分類</InputLabel>
            <Select
              value={selectedCategory}
              label="分類"
              onChange={(e) => setSelectedCategory(e.target.value as 'all' | 'drink' | 'oden')}
            >
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="drink">飲料</MenuItem>
              <MenuItem value="oden">關東煮</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary">
            共 {filteredProducts.length} 個商品
          </Typography>
        </Box>
      </Box>

      {/* 商品列表 */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      </Box>

      {/* 編輯對話框 */}
      <ProductEditDialog
        open={editDialog.open}
        product={editDialog.product}
        onClose={() => setEditDialog({ open: false, product: null })}
        onSave={handleSave}
      />
    </Box>
  )
}

export default ProductsPage 