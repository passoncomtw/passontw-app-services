import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import Explore from './screens/ExploreScreen';
import Home from './screens/HomeScreen';
import NotFound from './screens/NotFoundScreen';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import PublicScreen from './screens/PublicScreen';
import LoginScreen from './screens/LoginScreen';
import InitialScreen from './screens/InitialScreen';


const HomeTabs = createBottomTabNavigator({
  screens: {
    Home: {
      screen: Home,
      options: {
        headerShown: false,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
      },
    },
    Explore: {
      screen: Explore,
      options: {
        headerShown: false,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
      },
    },
  },
  screenOptions: {
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarBackground: TabBarBackground,
    tabBarStyle: Platform.select({
      ios: {
        // Use a transparent background on iOS to show the blur effect
        position: 'absolute' as const,
      },
      default: {  },
    }),
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    HomeTabs: {
      screen: HomeTabs,
      options: {
        headerShown: false,
      },
    },
    NotFound: {
      screen: NotFound,
      options: {
        title: '404',
      },
      linking: {
        path: '*',
      },
    },
  },
});

const PublicStack = createNativeStackNavigator({
  screens: {
    Public: {
      screen: PublicScreen,
      options: {
        headerShown: true,
        title: 'Public',
      },
    },
    Login: {
      screen: LoginScreen,
      options: {
        headerShown: true,
        title: 'Login',
      },
    },
  },
});

const InitialStack = createNativeStackNavigator({
  screens: {
    Initial: {
      screen: InitialScreen,
      options: {
        headerShown: true,
        title: 'Initial',
      },
    },
    
  },
});
export const Navigation = createStaticNavigation(InitialStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
