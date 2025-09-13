import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification behavior only if not in Expo Go
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.log('Notification handler setup skipped in Expo Go');
  }
}

export interface NotificationData {
  type: 'match' | 'reservation' | 'reminder' | 'promotion';
  title: string;
  message: string;
  data?: any;
}

// Register for push notifications with Expo Go compatibility
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Skip push notifications in Expo Go
    if (isExpoGo) {
      console.log('Push notifications are not fully supported in Expo Go. Using development build is recommended.');
      return null;
    }

    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId || 'default-project-id',
    });

    console.log('Push notification token:', token.data);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

// Save push token to user profile
export const savePushToken = async (userId: string, token: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', userId);

    if (error) {
      console.error('Error saving push token:', error);
    } else {
      console.log('Push token saved successfully');
    }
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

// Send local notification (for demo purposes) with Expo Go compatibility
export const sendLocalNotification = async (notificationData: NotificationData) => {
  try {
    // In Expo Go, show console log instead of actual notification
    if (isExpoGo) {
      console.log('📱 [DEMO NOTIFICATION]:', notificationData.title, '-', notificationData.message);
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.message,
        data: notificationData.data || {},
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
    // Fallback to console log
    console.log('📱 [FALLBACK NOTIFICATION]:', notificationData.title, '-', notificationData.message);
  }
};

// Send match notification
export const sendMatchNotification = async (matchedUserName: string) => {
  await sendLocalNotification({
    type: 'match',
    title: '🎉 New Match!',
    message: `You've been matched with ${matchedUserName} for dining!`,
    data: { type: 'match' },
  });
};

// Send reservation confirmation notification
export const sendReservationNotification = async (restaurantName: string, date: string, time: string) => {
  await sendLocalNotification({
    type: 'reservation',
    title: '✅ Reservation Confirmed',
    message: `Your table at ${restaurantName} is confirmed for ${date} at ${time}`,
    data: { type: 'reservation' },
  });
};

// Send reservation reminder notification
export const sendReservationReminder = async (restaurantName: string, time: string) => {
  await sendLocalNotification({
    type: 'reminder',
    title: '⏰ Reservation Reminder',
    message: `Don't forget your reservation at ${restaurantName} at ${time}!`,
    data: { type: 'reminder' },
  });
};

// Send promotion notification
export const sendPromotionNotification = async (title: string, message: string) => {
  await sendLocalNotification({
    type: 'promotion',
    title: title,
    message: message,
    data: { type: 'promotion' },
  });
};

// Schedule reservation reminder (1 hour before) with Expo Go compatibility
export const scheduleReservationReminder = async (restaurantName: string, reservationDateTime: Date) => {
  try {
    const reminderTime = new Date(reservationDateTime.getTime() - 60 * 60 * 1000); // 1 hour before
    
    if (reminderTime > new Date()) {
      // In Expo Go, just log the scheduled reminder
      if (isExpoGo) {
        console.log('📅 [DEMO REMINDER SCHEDULED]:', `Reservation at ${restaurantName} reminder set for ${reminderTime}`);
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Reservation Reminder',
          body: `Your reservation at ${restaurantName} is in 1 hour!`,
          data: { type: 'reminder' },
          sound: true,
        },
        trigger: {
          date: reminderTime,
        },
      });
      
      console.log('Reservation reminder scheduled for:', reminderTime);
    }
  } catch (error) {
    console.error('Error scheduling reservation reminder:', error);
    // Fallback to console log
    console.log('📅 [FALLBACK REMINDER]:', `Reservation at ${restaurantName} reminder would be set for 1 hour before`);
  }
};

// Handle notification received while app is running
export const handleNotificationReceived = (notification: Notifications.Notification) => {
  console.log('Notification received:', notification);
  // Handle the notification based on type
  const { type } = notification.request.content.data;
  
  switch (type) {
    case 'match':
      // Navigate to matching screen or show match details
      break;
    case 'reservation':
      // Navigate to reservations screen
      break;
    case 'reminder':
      // Show reminder details
      break;
    case 'promotion':
      // Navigate to promotions or discovery screen
      break;
    default:
      console.log('Unknown notification type:', type);
  }
};

// Handle notification tap (when app is opened from notification)
export const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
  console.log('Notification tapped:', response);
  const { type } = response.notification.request.content.data;
  
  // Handle navigation based on notification type
  switch (type) {
    case 'match':
      // Navigate to matching screen
      break;
    case 'reservation':
      // Navigate to reservations screen
      break;
    case 'reminder':
      // Navigate to reservation details
      break;
    case 'promotion':
      // Navigate to discovery screen
      break;
    default:
      console.log('Unknown notification type:', type);
  }
};

// Initialize notification listeners with Expo Go compatibility
export const initializeNotifications = () => {
  try {
    // Skip notification listeners in Expo Go
    if (isExpoGo) {
      console.log('Notification listeners skipped in Expo Go environment');
      return () => {}; // Return empty cleanup function
    }

    // Listen for notifications received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(handleNotificationReceived);
    
    // Listen for notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    
    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  } catch (error) {
    console.error('Error initializing notification listeners:', error);
    return () => {}; // Return empty cleanup function
  }
};

// Demo function to test notifications
export const testNotifications = async () => {
  console.log('Testing notifications...');
  
  // Test match notification
  setTimeout(() => {
    sendMatchNotification('Alex');
  }, 2000);
  
  // Test reservation notification
  setTimeout(() => {
    sendReservationNotification('Spice Garden Thai', 'Today', '7:30 PM');
  }, 4000);
  
  // Test promotion notification
  setTimeout(() => {
    sendPromotionNotification('🍕 Special Offer!', '20% off at Bella Vista Italian this weekend!');
  }, 6000);
};