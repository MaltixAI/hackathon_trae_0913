import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { Button, Card, TextInput, Chip, ActivityIndicator, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { searchRestaurantsOnWeb } from '../services/webSearchService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  address: string;
  phone?: string;
  image: string;
  distance: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  isSelected?: boolean;
}

const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Spice Garden Thai',
    cuisine: 'Thai',
    rating: 4.8,
    priceRange: '$$',
    address: '123 Main St, Downtown',
    phone: '(555) 123-4567',
    image: '🌶️',
    distance: '0.3 mi',
    description: 'Authentic Thai cuisine with fresh ingredients',
  },
  {
    id: '2',
    name: 'Bella Vista Italian',
    cuisine: 'Italian',
    rating: 4.6,
    priceRange: '$$$',
    address: '456 Oak Ave, Midtown',
    phone: '(555) 987-6543',
    image: '🍝',
    distance: '0.5 mi',
    description: 'Classic Italian dishes with modern flair',
  },
  {
    id: '3',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    rating: 4.9,
    priceRange: '$$$',
    address: '789 Pine St, Japantown',
    phone: '(555) 456-7890',
    image: '🍣',
    distance: '0.7 mi',
    description: 'Fresh sushi and traditional Japanese cuisine',
  },
  {
    id: '4',
    name: 'Taco Libre',
    cuisine: 'Mexican',
    rating: 4.4,
    priceRange: '$',
    address: '321 Mission St, Mission District',
    phone: '(555) 234-5678',
    image: '🌮',
    distance: '0.4 mi',
    description: 'Authentic Mexican street food',
  },
  {
    id: '5',
    name: 'Green Garden',
    cuisine: 'Healthy',
    rating: 4.5,
    priceRange: '$$',
    address: '901 Wellness Way, Health District',
    phone: '(555) 901-2345',
    image: '🥗',
    distance: '0.6 mi',
    description: 'Organic, plant-based cuisine',
  },
];

const DiscoveryScreen: React.FC = () => {
  const { width } = Dimensions.get('window');
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const cuisineTypes = ['All', 'Thai', 'Italian', 'Japanese', 'Mexican', 'Healthy', 'American', 'French', 'Chinese'];

  // Helper function to search restaurants from Supabase
  const searchRestaurants = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%`)
        .limit(10);
      
      return { data: data || [], error };
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return { data: [], error };
    }
  };

  // Helper function to get AI restaurant recommendations
  const getAIRestaurantRecommendations = async (mood: string, cravings: string[], preferences: string[]) => {
    try {
      const query = preferences.length > 0 ? preferences.join(' ') : 'restaurant';
      return await searchRestaurantsOnWeb(query, 'San Francisco');
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return [];
    }
  };

  useEffect(() => {
    // Load initial restaurants based on user preferences
    if (userProfile && userProfile.preferred_cuisines && userProfile.preferred_cuisines.length > 0) {
      loadRecommendedRestaurants();
    } else {
      loadAllRestaurants();
    }
  }, [userProfile]);

  const loadAllRestaurants = async () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setRestaurants(mockRestaurants);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Error', 'Failed to load restaurants');
      setIsLoading(false);
    }
  };

  const loadRecommendedRestaurants = async () => {
    if (!userProfile) return;
    
    setIsLoading(true);
    try {
      const mood = 'happy';
      const cravings = userProfile.food_tags || [];
      const preferences = userProfile.preferred_cuisines || [];
      
      const webResults = await getAIRestaurantRecommendations(mood, cravings, preferences);
      
      const { data: localResults } = await searchRestaurants(
        preferences.length > 0 ? preferences[0] : 'restaurant'
      );
      
      const allResults = [...webResults, ...(localResults || [])];
      const uniqueResults = allResults.filter((restaurant, index, self) => 
        index === self.findIndex(r => r.id === restaurant.id)
      );
      
      setRestaurants(uniqueResults.slice(0, 10));
    } catch (error) {
      console.error('Error loading recommended restaurants:', error);
      const filtered = mockRestaurants.filter(restaurant => 
        userProfile.preferred_cuisines?.includes(restaurant.cuisine)
      );
      setRestaurants(filtered.length > 0 ? filtered : mockRestaurants.slice(0, 8));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a search term to find restaurants.');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const cuisineFilter = selectedCuisine && selectedCuisine !== 'All' ? selectedCuisine : '';
      const fullQuery = `${searchQuery} ${cuisineFilter}`.trim();
      
      const webResults = await searchRestaurantsOnWeb(fullQuery, 'San Francisco');
      
      const convertedResults = webResults.map(result => ({
        id: result.id,
        name: result.name,
        cuisine: result.cuisine,
        rating: result.rating,
        priceRange: result.priceRange,
        address: result.address || 'Address not available',
        distance: '0.5 mi',
        image: result.imageUrl || '🍽️',
        imageUrl: result.imageUrl,
        description: result.description,
        isSelected: false,
        tags: result.tags || []
      }));

      setRestaurants(convertedResults.slice(0, 15));
      
      if (convertedResults.length === 0) {
        Alert.alert('No Results', 'No restaurants found for your search. Try different keywords.');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      const errorMessage = error.message || 'Failed to search restaurants. Please try again.';
      setError(errorMessage);
      setShowError(true);
      
      const filtered = mockRestaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setRestaurants(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRestaurantSelect = (restaurantId: string) => {
    if (selectedRestaurants.includes(restaurantId)) {
      setSelectedRestaurants(prev => prev.filter(id => id !== restaurantId));
    } else if (selectedRestaurants.length < 5) {
      setSelectedRestaurants(prev => [...prev, restaurantId]);
    }
  };

  const handleCuisineFilter = async (cuisine: string) => {
    setSelectedCuisine(cuisine);
    
    if (cuisine === 'All') {
      if (userProfile && userProfile.preferred_cuisines && userProfile.preferred_cuisines.length > 0) {
        loadRecommendedRestaurants();
      } else {
        loadAllRestaurants();
      }
    } else {
      setIsLoading(true);
      try {
        const webResults = await searchRestaurantsOnWeb(cuisine, 'San Francisco');
        const { data: localResults } = await searchRestaurants(cuisine);
        
        const allResults = [...webResults, ...(localResults || [])];
        const uniqueResults = allResults.filter((restaurant, index, self) => 
          index === self.findIndex(r => r.id === restaurant.id)
        );
        
        const filteredResults = uniqueResults.filter(restaurant => 
          restaurant.cuisine.toLowerCase() === cuisine.toLowerCase()
        );
        
        setRestaurants(filteredResults.slice(0, 12));
        
        if (filteredResults.length === 0) {
          const mockFiltered = mockRestaurants.filter(restaurant => 
            restaurant.cuisine === cuisine
          );
          setRestaurants(mockFiltered);
        }
      } catch (error) {
        console.error('Error filtering restaurants:', error);
        Alert.alert('Error', 'Failed to filter restaurants');
        
        const filtered = mockRestaurants.filter(restaurant => restaurant.cuisine === cuisine);
        setRestaurants(filtered);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProceedToMatching = () => {
    console.log('Selected restaurants:', selectedRestaurants);
    Alert.alert('Success', `You've selected ${selectedRestaurants.length} restaurants. Ready to find dining companions!`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFD700" />
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>🔍 Finding perfect restaurants for you...</Text>
          <Text style={styles.loadingSubtext}>
            Using AI to match your mood and preferences
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurant Discovery</Text>
        <Text style={styles.subtitle}>
          Select up to 5 restaurants that catch your interest
        </Text>
        <Text style={styles.selectionCount}>
          {selectedRestaurants.length}/5 selected
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            placeholder="Search restaurants or cuisine..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
            right={
              searchQuery ? (
                <TextInput.Icon 
                  icon="close" 
                  onPress={() => setSearchQuery('')} 
                />
              ) : null
            }
          />
          <Button
            mode="contained"
            onPress={handleSearch}
            loading={isSearching}
            disabled={isSearching || !searchQuery.trim()}
            style={styles.searchButton}
            contentStyle={styles.searchButtonContent}
          >
            Search
          </Button>
        </View>
      </View>

      {/* Cuisine Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {cuisineTypes.map((cuisine) => (
          <Chip
            key={cuisine}
            selected={selectedCuisine === cuisine}
            onPress={() => handleCuisineFilter(cuisine)}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
          >
            {cuisine}
          </Chip>
        ))}
      </ScrollView>

      {/* Restaurant List */}
      <ScrollView style={styles.restaurantList} showsVerticalScrollIndicator={false}>
        {restaurants.map((restaurant) => {
          const isSelected = selectedRestaurants.includes(restaurant.id);
          const canSelect = selectedRestaurants.length < 5 || isSelected;
          
          return (
            <TouchableOpacity
              key={restaurant.id}
              style={[
                styles.restaurantCard,
                isSelected && styles.restaurantCardSelected,
                !canSelect && styles.restaurantCardDisabled,
              ]}
              onPress={() => canSelect && handleRestaurantSelect(restaurant.id)}
              disabled={!canSelect}
            >
              <View style={styles.restaurantHeader}>
                {restaurant.imageUrl && restaurant.imageUrl.startsWith('http') ? (
                  <Image 
                    source={{ uri: restaurant.imageUrl }} 
                    style={styles.restaurantImage}
                  />
                ) : (
                  <Text style={styles.restaurantEmoji}>{restaurant.image || '🍽️'}</Text>
                )}
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                  <View style={styles.restaurantMeta}>
                    <View style={styles.ratingContainer}>
                      {renderStars(restaurant.rating)}
                      <Text style={styles.ratingText}>{restaurant.rating?.toFixed(1) || '4.0'}</Text>
                    </View>
                    <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
                    <Text style={styles.distance}>{restaurant.distance || '0.5 mi'}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  </View>
                )}
              </View>
              {restaurant.description && (
                <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Proceed Button */}
      {selectedRestaurants.length > 0 && (
        <View style={styles.proceedContainer}>
          <Button
            mode="contained"
            onPress={handleProceedToMatching}
            style={styles.proceedButton}
            contentStyle={styles.proceedButtonContent}
          >
            🤝 Find Dining Companions ({selectedRestaurants.length})
          </Button>
        </View>
      )}
      
      <Snackbar
        visible={showError}
        onDismiss={() => {
          setShowError(false);
          setError(null);
        }}
        duration={4000}
        style={styles.errorSnackbar}
      >
        {error || 'An error occurred'}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selectionCount: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  searchButton: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  searchButtonContent: {
    height: 56,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    backgroundColor: colors.surface,
  },
  filterChipText: {
    fontSize: 12,
  },
  restaurantList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  restaurantCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  restaurantCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  restaurantCardDisabled: {
    opacity: 0.5,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: colors.surface,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  priceRange: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  distance: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  restaurantDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  proceedContainer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  proceedButton: {
    backgroundColor: colors.primary,
  },
  proceedButtonContent: {
    height: 56,
  },
  errorSnackbar: {
    backgroundColor: colors.error,
    marginBottom: 20,
  },
});

export default DiscoveryScreen;