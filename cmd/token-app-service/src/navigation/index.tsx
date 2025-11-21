import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAppSelector } from './store/hooks';

import Explore from './screens/ExploreScreen';
import Home from './screens/HomeScreen';
import NotFound from './screens/NotFoundScreen';
import PublicScreen from './screens/PublicScreen';
import LoginScreen from './screens/LoginScreen';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

/**
 * 底部 Tab 導航定義
 */
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute' as const,
          },
          default: {},
        }),
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * 導航堆疊定義
 */
const Stack = createNativeStackNavigator();

/**
 * 載入畫面組件
 * 在驗證狀態載入時顯示
 */
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  );
}

/**
 * 已驗證用戶的導航堆疊
 */
function AuthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen 
        name="NotFound" 
        component={NotFound}
        options={{ title: '404', headerShown: true }}
      />
    </Stack.Navigator>
  );
}

/**
 * 未驗證用戶的公開頁面導航堆疊
 */
function PublicStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Public" 
        component={PublicScreen}
        options={{ headerShown: true, title: 'Public' }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: true, title: 'Login' }}
      />
    </Stack.Navigator>
  );
}

/**
 * 根導航組件
 * 使用 early return 模式根據驗證狀態渲染對應的導航堆疊
 */
export function Navigation(props: any) {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Early return: 驗證狀態載入中
  if (loading) {
    return (
      <NavigationContainer {...props}>
        <LoadingScreen />
      </NavigationContainer>
    );
  }

  // Early return: 已驗證用戶
  if (isAuthenticated) {
    return (
      <NavigationContainer {...props}>
        <AuthenticatedStack />
      </NavigationContainer>
    );
  }

  // 預設: 未驗證用戶
  return (
    <NavigationContainer {...props}>
      <PublicStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

// 型別定義
type RootStackParamList = {
  HomeTabs: undefined;
  NotFound: undefined;
};

type PublicStackParamList = {
  Public: undefined;
  Login: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList, PublicStackParamList {}
  }
}
