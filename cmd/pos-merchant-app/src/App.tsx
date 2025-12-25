import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from './store';
import { LoginPage, POSPage, ProductsPage, CheckoutPage } from './pages';
import { ErrorMessage } from './components';

// 創建 Material-UI 主題
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route 
              path="*" 
              element={
                <ErrorMessage 
                  title="頁面未找到"
                  message="您訪問的頁面不存在，請檢查 URL 或返回首頁。"
                  severity="warning"
                />
              } 
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
