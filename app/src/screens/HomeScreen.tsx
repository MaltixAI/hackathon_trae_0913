import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Button, Card, TextInput, Switch, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { searchRestaurants } from '../lib/supabase';
import { colors } from '../theme/theme';

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const moodOptions: MoodOption[] = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#F39C12' },
  { id: 'stressed', emoji: '😰', label: 'Stressed', color: '#E74C3C' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: '#9B59B6' },
  { id: 'celebratory', emoji: '🎉', label: 'Celebrating', color: '#E91E63' },
  { id: 'cozy', emoji: '🏠', label: 'Cozy', color: '#795548' },
  { id: 'adventurous', emoji: '🌟', label: 'Adventurous', color: '#FF5722' },
];

const cravingOptions = [
  '🍜 Ramen', '🍕 Pizza', '🍣 Sushi', '🌮 Tacos', '🍝 Pasta',
  '🍔 Burgers', '🥗 Salads', '🍛 Curry', '🥘 Stew', '🍰 Dessert'
];

const HomeScreen: React.FC = () => {
  const { width } = Dimensions.get('window');
  const { user, userProfile } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedCravings, setSelectedCravings] = useState<string[]>([]);
  const [timePreference, setTimePreference] = useState<'2h' | 'later'>('2h');
  const [foodThoughts, setFoodThoughts] = useState('');
  const [location, setLocation] = useState<string>('San Francisco, CA');
  const [weather, setWeather] = useState({ temp: 72, condition: 'Sunny' });
  const [isAvailable, setIsAvailable] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // For demo purposes, we'll use a mock location
      setLocation('San Francisco, CA');
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleCravingToggle = (craving: string) => {
    setSelectedCravings(prev => 
      prev.includes(craving) 
        ? prev.filter(c => c !== craving)
        : [...prev, craving]
    );
  };

  const handleGenerateRecommendations = async () => {
    if (!selectedMood) {
      Alert.alert('Mood Required', 'Please select your current mood first!');
      return;
    }

    if (!user || !userProfile) {
      Alert.alert('Error', 'Please sign in to get personalized recommendations');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate search query based on mood, cravings, and user preferences
      let searchQuery = '';
      
      // Mood-based cuisine mapping
      const moodCuisineMap: { [key: string]: string[] } = {
        'happy': ['Italian', 'Mexican', 'Thai'],
        'stressed': ['Comfort Food', 'American', 'Chinese'],
        'adventurous': ['Fusion', 'Ethiopian', 'Korean'],
        'celebratory': ['French', 'Italian', 'Mediterranean'],
        'tired': ['Japanese', 'Vietnamese', 'Comfort Food'],
        'cozy': ['Italian', 'American', 'Chinese'],
      };

      // Weather-based suggestions
      const weatherCuisineMap: { [key: string]: string[] } = {
        'Sunny': ['Mediterranean', 'Mexican', 'Thai'],
        'Rainy': ['Comfort Food', 'Chinese', 'Italian'],
        'Cold': ['Indian', 'Korean', 'American'],
        'Hot': ['Japanese', 'Vietnamese', 'Mediterranean'],
      };

      // HARDCODED: Use "Spicy Lover" preferences for recommendations
      const spicyLoverCuisines = ['Mexican', 'Thai', 'Indian', 'Korean', 'Szechuan'];
      const moodCuisines = moodCuisineMap[selectedMood] || [];

      // Prioritize spicy cuisines for "Spicy Lover" personality
      const preferredCuisines = spicyLoverCuisines.filter(cuisine =>
        moodCuisines.includes(cuisine)
      );

      if (preferredCuisines.length > 0) {
        searchQuery = preferredCuisines[0];
      } else {
        // Default to spicy cuisine if no mood match
        searchQuery = spicyLoverCuisines[0]; // Mexican
      }

      // Add cravings to search if specified
      if (selectedCravings.length > 0) {
        searchQuery += ` ${selectedCravings.join(' ')}`;
      }

      // Add food thoughts to search if specified
      if (foodThoughts.trim()) {
        searchQuery += ` ${foodThoughts.trim()}`;
      }

      // Search restaurants
      const { data: restaurants, error } = await searchRestaurants(searchQuery);
      
      if (error) {
        throw new Error(error.message);
      }

      if (restaurants && restaurants.length > 0) {
        setRecommendations(restaurants.slice(0, 5)); // Top 5 recommendations
        Alert.alert(
          '🤖 AI Recommendations Ready!',
          `Found ${restaurants.length} restaurants perfect for your ${selectedMood} mood!`,
          [
            {
              text: 'View All',
              onPress: () => console.log('Navigate to Discovery with recommendations'),
            },
            { text: 'OK', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(
          'No Results',
          'No restaurants found matching your preferences. Try adjusting your mood or cravings!'
        );
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      Alert.alert(
        'Error',
        'Failed to generate recommendations. Please try again later.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.locationText}>{location}</Text>
          </View>
          <View style={styles.weatherContainer}>
            <Text style={styles.weatherText}>{weather.temp}°F • {weather.condition}</Text>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>
            Good {getTimeOfDay()}, {userProfile?.name || 'Foodie'}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            How are you feeling today? Let's find the perfect meal for your mood!
          </Text>
          {userProfile?.food_tags && userProfile.food_tags.length > 0 && (
            <View style={styles.userTagsContainer}>
              <Text style={styles.userTagsLabel}>Your food personality:</Text>
              <View style={styles.userTags}>
                {userProfile.food_tags.slice(0, 3).map((tag, index) => (
                  <Chip key={index} style={styles.userTag} textStyle={styles.userTagText}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Mood Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Your Mood</Text>
            <View style={styles.moodGrid}>
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodOption,
                    selectedMood === mood.id && {
                      backgroundColor: mood.color + '20',
                      borderColor: mood.color,
                    }
                  ]}
                  onPress={() => handleMoodSelect(mood.id)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Time Preference */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>When do you want to eat?</Text>
            <View style={styles.timeContainer}>
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  timePreference === '2h' && styles.timeOptionSelected
                ]}
                onPress={() => setTimePreference('2h')}
              >
                <Ionicons 
                  name="time-outline" 
                  size={20} 
                  color={timePreference === '2h' ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.timeText,
                  timePreference === '2h' && styles.timeTextSelected
                ]}>Within 2 hours</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  timePreference === 'later' && styles.timeOptionSelected
                ]}
                onPress={() => setTimePreference('later')}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={timePreference === 'later' ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.timeText,
                  timePreference === 'later' && styles.timeTextSelected
                ]}>Later today</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Cravings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>What are you craving?</Text>
            <View style={styles.cravingsContainer}>
              {cravingOptions.map((craving) => (
                <Chip
                  key={craving}
                  selected={selectedCravings.includes(craving)}
                  onPress={() => handleCravingToggle(craving)}
                  style={styles.cravingChip}
                  textStyle={styles.cravingText}
                >
                  {craving}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Chat Input */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.chatHeader}>
              <Text style={styles.sectionTitle}>💬 Chat with your Food Avatar</Text>
              <TouchableOpacity onPress={() => setShowChatInput(!showChatInput)}>
                <Ionicons 
                  name={showChatInput ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>
            
            {showChatInput && (
              <View style={styles.chatContainer}>
                <TextInput
                  label="Tell me more about what you're in the mood for..."
                  value={foodThoughts}
                  onChangeText={setFoodThoughts}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.chatInput}
                  placeholder="e.g., Something warm and comforting, or I want to try something new..."
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Availability Toggle */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.availabilityContainer}>
              <View style={styles.availabilityInfo}>
                <Text style={styles.sectionTitle}>🤝 Find Dining Companions</Text>
                <Text style={styles.availabilitySubtitle}>
                  Toggle availability to match with other foodies
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.availabilityToggle,
                  isAvailable && styles.availabilityToggleActive
                ]}
                onPress={toggleAvailability}
              >
                <View style={[
                  styles.availabilitySlider,
                  isAvailable && styles.availabilitySliderActive
                ]} />
              </TouchableOpacity>
            </View>
            {isAvailable && (
              <Text style={styles.availabilityStatus}>
                ✨ You're available for companion dining!
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Generate Recommendations Button */}
        <Button
          mode="contained"
          onPress={handleGenerateRecommendations}
          style={styles.generateButton}
          contentStyle={styles.generateButtonContent}
          disabled={!selectedMood || isGenerating}
          loading={isGenerating}
        >
          {isGenerating ? 'Finding Restaurants...' : '🍽️ Find Perfect Restaurants'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodOption: {
    width: (Dimensions.get('window').width - 80) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  timeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  timeTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  cravingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cravingChip: {
    marginBottom: 4,
  },
  cravingText: {
    fontSize: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatContainer: {
    marginTop: 8,
  },
  chatInput: {
    backgroundColor: colors.surface,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilitySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  availabilityToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  availabilityToggleActive: {
    backgroundColor: colors.primary,
  },
  availabilitySlider: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  availabilitySliderActive: {
    alignSelf: 'flex-end',
  },
  availabilityStatus: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  generateButton: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: colors.primary,
  },
  generateButtonContent: {
    height: 56,
  },
  userTagsContainer: {
    marginTop: 16,
  },
  userTagsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  userTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  userTag: {
    backgroundColor: colors.primary + '15',
  },
  userTagText: {
    fontSize: 11,
    color: colors.primary,
  },
});

export default HomeScreen;