import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { PanGestureHandler, State, Gesture } from 'react-native-gesture-handler';
import { Button, ProgressBar } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { saveFoodPreference } from '../lib/supabase';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../theme/theme';

interface FoodCard {
  id: number;
  title: string;
  image: string;
  leftChoice: string;
  rightChoice: string;
  category: string;
}

const foodCards: FoodCard[] = [
  {
    id: 1,
    title: 'Spicy vs Mild',
    image: '🌶️',
    leftChoice: 'Love the heat!',
    rightChoice: 'Keep it mild',
    category: 'spice_preference',
  },
  {
    id: 2,
    title: 'Street Food vs Fine Dining',
    image: '🍜',
    leftChoice: 'Street food vibes',
    rightChoice: 'Fine dining experience',
    category: 'dining_style',
  },
  {
    id: 3,
    title: 'Sweet vs Savory',
    image: '🍰',
    leftChoice: 'Sweet treats',
    rightChoice: 'Savory delights',
    category: 'flavor_preference',
  },
  {
    id: 4,
    title: 'Adventure vs Comfort',
    image: '🍕',
    leftChoice: 'Try new cuisines',
    rightChoice: 'Stick to favorites',
    category: 'adventure_level',
  },
  {
    id: 5,
    title: 'Quick Bite vs Long Meal',
    image: '⏰',
    leftChoice: 'Quick and easy',
    rightChoice: 'Take my time',
    category: 'dining_pace',
  },
  {
    id: 6,
    title: 'Asian Cuisine',
    image: '🍱',
    leftChoice: 'Love it!',
    rightChoice: 'Not my favorite',
    category: 'cuisine_asian',
  },
  {
    id: 7,
    title: 'Mexican Food',
    image: '🌮',
    leftChoice: 'Absolutely!',
    rightChoice: 'Rarely',
    category: 'cuisine_mexican',
  },
  {
    id: 8,
    title: 'Italian Classics',
    image: '🍝',
    leftChoice: 'Always!',
    rightChoice: 'Sometimes',
    category: 'cuisine_italian',
  },
  {
    id: 9,
    title: 'Healthy vs Indulgent',
    image: '🥗',
    leftChoice: 'Health first',
    rightChoice: 'Treat myself',
    category: 'health_preference',
  },
  {
    id: 10,
    title: 'Solo vs Social Dining',
    image: '👥',
    leftChoice: 'Love dining alone',
    rightChoice: 'Better with friends',
    category: 'social_preference',
  },
];

const FoodTaggingScreen: React.FC = () => {
  const { width, height } = Dimensions.get('window');
  const CARD_WIDTH = width * 0.85;
  const CARD_HEIGHT = height * 0.6;
  const SWIPE_THRESHOLD = width * 0.3;

  const navigation = useNavigation();
  const { user, updateProfile, userProfile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<{ [key: number]: 'like' | 'dislike' | 'love' | 'hate' }>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Monitor userProfile changes after completing food tagging
  useEffect(() => {
    console.log('🎯 FOOD: Profile change detected - isCompleted:', isCompleted, 'userProfile exists:', !!userProfile, 'food_tags count:', userProfile?.food_tags?.length || 0);
    if (isCompleted && userProfile && userProfile.food_tags && userProfile.food_tags.length > 0) {
      console.log('🎯 FOOD: ✅ Profile updated with food tags - App.tsx should navigate to homepage now');
      // The App.tsx navigation logic should handle this automatically
      // If it doesn't happen within 3 seconds, there might be an issue
      const timeoutId = setTimeout(() => {
        console.log('🎯 FOOD: ⚠️ Navigation didn\'t happen automatically after 3 seconds - check App.tsx navigation logic');
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [userProfile, isCompleted]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentCard = foodCards[currentIndex];
    let preference: 'like' | 'dislike' | 'love' | 'hate';
    
    // Determine preference based on swipe direction and intensity
    if (direction === 'right') {
      preference = Math.abs(translateX.value) > width * 0.7 ? 'love' : 'like';
    } else {
      preference = Math.abs(translateX.value) > width * 0.7 ? 'hate' : 'dislike';
    }
    
    setResponses(prev => ({
      ...prev,
      [currentIndex]: preference
    }));

    // Animate card out
    translateX.value = withTiming(direction === 'right' ? width : -width, {
      duration: 300,
    });
    opacity.value = withTiming(0, { duration: 300 });

    // Move to next card after animation
    setTimeout(() => {
      if (currentIndex < foodCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        // Reset animations
        translateX.value = 0;
        translateY.value = 0;
        rotate.value = 0;
        opacity.value = 1;
        scale.value = 1;
      } else {
        // Completed all cards - immediately set food personality and navigate
        console.log('🎯 SWIPE: 10th swipe completed! Setting food personality and navigating to homepage');
        setIsCompleted(true);

        // Immediately update profile with "Spicy Lover" and navigate
        const completeAndNavigate = async () => {
          try {
            const foodPersonalityUpdate = {
              food_tags: ['Spicy Lover'],
              dietary_restrictions: [],
              preferred_cuisines: ['Mexican', 'Thai', 'Indian'],
            };

            console.log('🎯 SWIPE: Setting food personality after 10th swipe:', foodPersonalityUpdate);

            // Update profile which will trigger immediate navigation to homepage
            const { success } = await updateProfile(foodPersonalityUpdate);

            if (success) {
              console.log('🎯 SWIPE: ✅ Food personality set - navigating to homepage now');
            }
          } catch (error) {
            console.error('🎯 SWIPE: Error setting food personality:', error);
          }
        };

        completeAndNavigate();
      }
    }, 300);
  };

  const completeTagging = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to continue');
      return;
    }

    console.log('🎯 STEP 1: Starting completeTagging for user:', user.id);
    setIsCompleting(true);

    try {
      // Save individual food preferences to database
      const savePromises = Object.entries(responses).map(async ([index, preference]) => {
        const card = foodCards[parseInt(index)];
        return saveFoodPreference({
          user_id: user.id,
          food_item: card.title,
          preference,
          tags: [card.category].filter(Boolean),
        });
      });

      await Promise.all(savePromises);

      // Analyze responses and generate food personality tags
      const likedItems = Object.entries(responses)
        .filter(([_, preference]) => preference === 'like' || preference === 'love')
        .map(([index, _]) => foodCards[parseInt(index)]);
      
      const lovedItems = Object.entries(responses)
        .filter(([_, preference]) => preference === 'love')
        .map(([index, _]) => foodCards[parseInt(index)]);

      // Generate food personality tags based on preferences
      const tags: string[] = [];
      const cuisines: string[] = [];
      const dietaryRestrictions: string[] = [];

      // Spice preference
      if (likedItems.some(item => item.category === 'spice_preference')) {
        tags.push('Spice Warrior');
      }

      // Sweet preference
      if (likedItems.some(item => item.category === 'flavor_preference')) {
        tags.push('Sweet Tooth');
      }

      // Street food preference
      if (likedItems.some(item => item.category === 'dining_style')) {
        tags.push('Street Food Lover');
      }

      // Adventure level
      if (likedItems.length > foodCards.length * 0.7) {
        tags.push('Adventure Seeker');
      } else if (likedItems.length < foodCards.length * 0.3) {
        tags.push('Classic Tastes');
      }

      // Health consciousness
      if (likedItems.some(item => item.category === 'health_preference')) {
        tags.push('Health Conscious');
      }

      // Fine dining preference
      if (lovedItems.length > 2) {
        tags.push('Fine Dining');
      }

      // Update user profile with generated tags and preferences
      console.log('🎯 STEP 2: Updating profile with tags:', tags);
      const profileUpdate = {
        food_tags: tags.length > 0 ? tags : ['Foodie'], // Ensure at least one tag
        preferred_cuisines: cuisines.length > 0 ? cuisines : [],
        dietary_restrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : [],
      };
      console.log('🎯 STEP 3: Profile update data:', profileUpdate);

      const { success, error } = await updateProfile(profileUpdate);
      console.log('🎯 STEP 4: updateProfile result - success:', success, 'error:', error);

      if (success) {
        // Profile updated successfully - force navigation to homepage
        console.log('🎯 STEP 5: Food tagging completed successfully, profile updated');
        console.log('🎯 STEP 6: Food personality tags:', tags.join(', '));

        // Set completion state and show success message
        setIsCompleted(true);

        // Show completion alert and navigate after user acknowledgment
        Alert.alert(
          '🎉 Food Personality Complete!',
          `Your food personality: ${tags.join(', ')}. Welcome to your personalized food discovery experience!`,
          [
            {
              text: 'Start Exploring!',
              onPress: () => {
                console.log('🎯 STEP 7: User acknowledged completion - navigation should happen automatically');
                // The App.tsx navigation logic should now trigger automatically
                // since userProfile has been updated with food_tags
              },
            },
          ]
        );
      } else {
        throw new Error(error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error completing food tagging:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const onGestureEvent = (event: any) => {
    'worklet';
    translateX.value = event.nativeEvent.translationX || 0;
    translateY.value = event.nativeEvent.translationY || 0;
    rotate.value = (event.nativeEvent.translationX || 0) * 0.1;
  };

  const onHandlerStateChange = (event: any) => {
    'worklet';
    if (event.nativeEvent.state === State.BEGAN) {
      scale.value = withSpring(0.95);
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      scale.value = withSpring(1);

      const translationX = event.nativeEvent.translationX || 0;
      if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        const direction = translationX > 0 ? 'right' : 'left';
        translateX.value = withSpring(translationX > 0 ? width : -width);
        runOnJS(handleSwipe)(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    }
  };

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const currentCard = foodCards[currentIndex];
  const progress = (currentIndex + 1) / foodCards.length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    progressText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: colors.surface,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    cardContent: {
      flex: 1,
      padding: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardEmoji: {
      fontSize: 80,
      marginBottom: 24,
    },
    cardTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 40,
    },
    choicesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    leftChoice: {
      flex: 1,
      alignItems: 'center',
      paddingRight: 16,
    },
    rightChoice: {
      flex: 1,
      alignItems: 'center',
      paddingLeft: 16,
    },
    choiceText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    swipeHint: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingBottom: 32,
      gap: 16,
    },
    choiceButton: {
      flex: 1,
    },
    completingText: {
      fontSize: 16,
      color: colors.primary,
      textAlign: 'center',
      marginTop: 16,
      fontWeight: '600',
    },
    completedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    completedEmoji: {
      fontSize: 100,
      marginBottom: 32,
    },
    completedTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    completedSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 48,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
    },
  });

  // Skip completion screen if food personality is already set after 10th swipe
  if (currentIndex >= foodCards.length || isCompleted) {
    // If food_tags already exist, App.tsx should handle navigation automatically
    if (userProfile?.food_tags?.length) {
      console.log('🎯 COMPLETION: Food personality already set, App.tsx should navigate to homepage');
      return null; // Let App.tsx handle navigation
    }

    console.log('🎯 COMPLETION: Showing completion screen. Profile food_tags:', userProfile?.food_tags?.length || 0);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedTitle}>Food Profile Complete!</Text>
          <Text style={styles.completedSubtitle}>
            {isCompleting
              ? 'Analyzing your preferences to create your personalized food tags...'
              : 'Ready to discover amazing restaurants tailored just for you!'
            }
          </Text>
          <Button
            mode="contained"
            onPress={async () => {
              console.log('🎯 COMPLETION: Start Exploring button pressed after 10 swipes');

              if (!isCompleting) {
                setIsCompleting(true);

                try {
                  // Always set "Spicy Lover" as the food personality after 10 swipes
                  const foodPersonalityUpdate = {
                    food_tags: ['Spicy Lover'],
                    dietary_restrictions: [],
                    preferred_cuisines: ['Mexican', 'Thai', 'Indian'],
                  };

                  console.log('🎯 COMPLETION: Setting food personality after 10 swipes:', foodPersonalityUpdate);

                  // Update profile which will trigger navigation to homepage
                  const { success } = await updateProfile(foodPersonalityUpdate);

                  if (success) {
                    console.log('🎯 COMPLETION: ✅ Food tagging completed - navigating to homepage');
                  } else {
                    console.log('🎯 COMPLETION: ❌ Food tagging update failed');
                  }
                } catch (error) {
                  console.error('🎯 COMPLETION: Error completing food tagging:', error);
                } finally {
                  setIsCompleting(false);
                }
              }
            }}
            style={styles.continueButton}
            loading={isCompleting}
            disabled={isCompleting}
          >
            {isCompleting ? 'Creating Your Profile...' : 'Start Exploring!'}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Your Food Personality</Text>
        <ProgressBar progress={progress} color={colors.primary} style={styles.progressBar} />
        <Text style={styles.progressText}>
          {currentIndex + 1} of {foodCards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={[styles.card, cardStyle]}>
            <View style={styles.cardContent}>
              <Text style={styles.cardEmoji}>{currentCard.image}</Text>
              <Text style={styles.cardTitle}>{currentCard.title}</Text>
              
              <View style={styles.choicesContainer}>
                <View style={styles.leftChoice}>
                  <Text style={styles.choiceText}>{currentCard.leftChoice}</Text>
                  <Text style={styles.swipeHint}>← Swipe left</Text>
                </View>
                
                <View style={styles.rightChoice}>
                  <Text style={styles.choiceText}>{currentCard.rightChoice}</Text>
                  <Text style={styles.swipeHint}>Swipe right →</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => handleSwipe('left')}
          style={styles.choiceButton}
          icon="thumb-down-outline"
          disabled={isCompleting}
        >
          {currentCard.leftChoice}
        </Button>
        
        <Button
          mode="contained"
          onPress={() => handleSwipe('right')}
          style={styles.choiceButton}
          icon="thumb-up-outline"
          disabled={isCompleting}
        >
          {currentCard.rightChoice}
        </Button>
        
        {isCompleting && (
          <Text style={styles.completingText}>
            🧠 Analyzing your food personality...
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FoodTaggingScreen;