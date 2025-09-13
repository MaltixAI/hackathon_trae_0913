import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { initializeNotifications, registerForPushNotifications } from './src/services/notificationService';

// Import contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Import screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import FoodTaggingScreen from './src/screens/FoodTaggingScreen';
import HomeScreen from './src/screens/HomeScreen';
import DiscoveryScreen from './src/screens/DiscoveryScreen';
import MatchingScreen from './src/screens/MatchingScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import theme
import { theme, colors } from './src/theme/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();



// Loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// Main tab navigator for authenticated users
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Discovery') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Matching') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discovery" component={DiscoveryScreen} />
      <Tab.Screen name="Matching" component={MatchingScreen} />
      <Tab.Screen name="Reservations" component={ReservationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Auth stack for unauthenticated users
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="FoodTagging" component={FoodTaggingScreen} />
    </Stack.Navigator>
  );
};

// App navigator that handles auth state
const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();

  console.log('🎯 NAV: AppNavigator - user:', !!user, 'userProfile:', !!userProfile, 'food_tags:', userProfile?.food_tags?.length || 0, 'loading:', loading);

  if (loading) {
    return <LoadingScreen />;
  }

  // If user is authenticated and has completed food tagging, go to homepage
  if (user && userProfile && userProfile.food_tags && userProfile.food_tags.length > 0) {
    console.log('🎯 NAV: ✅ Going to MainTabs (Homepage) - Food tagging completed');
    return <MainTabs />;
  }

  // If user is authenticated but needs to complete food tagging
  if (user) {
    console.log('🎯 NAV: ⚠️ Going to FoodTagging - User needs to complete 10 swipes');
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="FoodTagging" component={FoodTaggingScreen} />
      </Stack.Navigator>
    );
  }

  // User is not authenticated
  console.log('Navigation: Going to AuthStack');
  return <AuthStack />;
};

export default function App() {
  useEffect(() => {
    // Initialize push notifications with error handling for Expo Go
    const initNotifications = async () => {
      try {
        // Check if running in Expo Go
        const isExpoGo = Constants.appOwnership === 'expo';
        
        if (isExpoGo) {
          console.log('🚀 Running in Expo Go - Some features may be limited');
          console.log('💡 For full functionality, consider using a development build');
        }
        
        const token = await registerForPushNotifications();
        if (token) {
          console.log('Push notification token registered:', token);
        }
        
        // Initialize notification listeners
        const cleanup = initializeNotifications();
        
        return cleanup;
      } catch (error) {
        console.error('Error initializing notifications:', error);
        // Return empty cleanup function to prevent crashes
        return () => {};
      }
    };
    
    let cleanup: Promise<() => void>;
    
    // Wrap in try-catch to prevent app crashes
    try {
      cleanup = initNotifications();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      cleanup = new Promise<() => void>(resolve => resolve(() => {}));
    }
    
    return () => {
      if (cleanup) {
        cleanup
          .then(cleanupFn => {
            if (typeof cleanupFn === 'function') {
              cleanupFn();
            }
          })
          .catch(error => {
            console.error('Error during cleanup:', error);
          });
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});