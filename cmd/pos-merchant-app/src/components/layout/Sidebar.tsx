import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import {
  Home,
  Info,
  Settings,
  Dashboard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSidebarOpen } from '../../reducers/appReducer';

const drawerWidth = 240;

const menuItems = [
  { text: '首頁', icon: <Home />, path: '/' },
  { text: '儀表板', icon: <Dashboard />, path: '/dashboard' },
  { text: '關於', icon: <Info />, path: '/about' },
  { text: '設置', icon: <Settings />, path: '/settings' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.app);

  const handleItemClick = (path: string) => {
    navigate(path);
    dispatch(setSidebarOpen(false));
  };

  const handleClose = () => {
    dispatch(setSidebarOpen(false));
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="temporary"
      anchor="left"
      open={sidebarOpen}
      onClose={handleClose}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleItemClick(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
