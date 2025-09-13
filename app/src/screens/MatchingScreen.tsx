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
} from 'react-native';
import { Button, Card, Avatar, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

interface User {
  id: string;
  name: string;
  age: number;
  avatar: string;
  foodTags: string[];
  compatibilityScore: number;
  commonInterests: string[];
  preferredCuisines: string[];
  isOnline: boolean;
}

interface CounterSign {
  user1Sign: string;
  user2Sign: string;
  category: string;
  source: string;
  instructions: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex',
    age: 28,
    avatar: '👨‍🍳',
    foodTags: ['Spice Warrior', 'Street Food Lover', 'Adventure Seeker'],
    compatibilityScore: 0.89,
    commonInterests: ['Thai Food', 'Spicy Dishes', 'Food Photography'],
    preferredCuisines: ['Thai', 'Mexican', 'Indian'],
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sarah',
    age: 25,
    avatar: '👩‍🌾',
    foodTags: ['Health Conscious', 'Organic Lover', 'Sweet Tooth'],
    compatibilityScore: 0.76,
    commonInterests: ['Healthy Eating', 'Desserts', 'Coffee'],
    preferredCuisines: ['Mediterranean', 'Healthy', 'French'],
    isOnline: true,
  },
  {
    id: '3',
    name: 'Mike',
    age: 32,
    avatar: '👨‍💼',
    foodTags: ['Fine Dining', 'Wine Enthusiast', 'Classic Tastes'],
    compatibilityScore: 0.82,
    commonInterests: ['Wine Pairing', 'Fine Dining', 'Italian Cuisine'],
    preferredCuisines: ['Italian', 'French', 'American'],
    isOnline: false,
  },
  {
    id: '4',
    name: 'Emma',
    age: 29,
    avatar: '👩‍🎨',
    foodTags: ['Creative Eater', 'Instagram Foodie', 'Fusion Lover'],
    compatibilityScore: 0.71,
    commonInterests: ['Food Photography', 'Fusion Cuisine', 'Brunch'],
    preferredCuisines: ['Fusion', 'Japanese', 'Korean'],
    isOnline: true,
  },
];

const counterSigns: CounterSign[] = [
  {
    user1Sign: "May the Force be with you",
    user2Sign: "And also with you",
    category: "film",
    source: "Star Wars",
    instructions: "Use this greeting when you meet at the restaurant"
  },
  {
    user1Sign: "Is this the real life?",
    user2Sign: "Is this just fantasy?",
    category: "lyrics",
    source: "Queen - Bohemian Rhapsody",
    instructions: "Start with this line to identify each other"
  },
  {
    user1Sign: "It was the best of times",
    user2Sign: "It was the worst of times",
    category: "literature",
    source: "Charles Dickens - A Tale of Two Cities",
    instructions: "Use this classic opening line as your counter sign"
  },
  {
    user1Sign: "That's what she said",
    user2Sign: "Bears, beets, Battlestar Galactica",
    category: "tv",
    source: "The Office",
    instructions: "Reference these iconic lines to find each other"
  },
];

const MatchingScreen: React.FC = () => {
  const { width } = Dimensions.get('window');
  const [isSearching, setIsSearching] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [counterSign, setCounterSign] = useState<CounterSign | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const startMatching = () => {
    setIsSearching(true);
    setSearchTime(0);
    
    // Simulate finding matches
    setTimeout(() => {
      const onlineUsers = mockUsers.filter(user => user.isOnline);
      setAvailableUsers(onlineUsers);
      setIsSearching(false);
    }, 3000);
  };

  const sendMatchRequest = (user: User) => {
    setSelectedUser(user);
    
    // Simulate match acceptance
    setTimeout(() => {
      const randomSign = counterSigns[Math.floor(Math.random() * counterSigns.length)];
      setMatchedUser(user);
      setCounterSign(randomSign);
      setSelectedUser(null);
      setSessionActive(true);
      
      Alert.alert(
        '🎉 Match Found!',
        `You've been matched with ${user.name}! Your counter signs have been assigned.`,
        [{ text: 'Great!', style: 'default' }]
      );
    }, 2000);
  };

  const proceedToReservation = () => {
    Alert.alert(
      'Ready to Book?',
      'Would you like to make a reservation at one of your selected restaurants?',
      [
        { text: 'Not Yet', style: 'cancel' },
        { text: 'Yes, Book Now', onPress: () => console.log('Navigate to reservations') }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCompatibilityScore = (score: number) => {
    const percentage = Math.round(score * 100);
    const color = score >= 0.8 ? colors.success : score >= 0.7 ? colors.warning : colors.textSecondary;
    
    return (
      <View style={styles.compatibilityContainer}>
        <Text style={[styles.compatibilityScore, { color }]}>{percentage}%</Text>
        <Text style={styles.compatibilityLabel}>Match</Text>
      </View>
    );
  };

  if (isSearching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.searchingTitle}>🔍 Finding Your Perfect Dining Companion</Text>
          <Text style={styles.searchingSubtitle}>
            Analyzing compatibility with nearby foodies...
          </Text>
          <Text style={styles.searchingTime}>Search time: {formatTime(searchTime)}</Text>
          
          <Button
            mode="outlined"
            onPress={() => setIsSearching(false)}
            style={styles.cancelButton}
          >
            Cancel Search
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (matchedUser && counterSign) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.matchedContainer}>
            <Text style={styles.matchedEmoji}>🎉</Text>
            <Text style={styles.matchedTitle}>You're Matched!</Text>
            <Text style={styles.matchedSubtitle}>
              You and {matchedUser.name} are ready to dine together
            </Text>

            {/* Matched User Info */}
            <Card style={styles.matchedUserCard}>
              <Card.Content>
                <View style={styles.matchedUserHeader}>
                  <Text style={styles.matchedUserAvatar}>{matchedUser.avatar}</Text>
                  <View style={styles.matchedUserInfo}>
                    <Text style={styles.matchedUserName}>{matchedUser.name}, {matchedUser.age}</Text>
                    {renderCompatibilityScore(matchedUser.compatibilityScore)}
                  </View>
                </View>
                
                <Text style={styles.sectionTitle}>Common Interests</Text>
                <View style={styles.interestsContainer}>
                  {matchedUser.commonInterests.map((interest, index) => (
                    <Chip key={index} style={styles.interestChip} textStyle={styles.interestText}>
                      {interest}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>

            {/* Counter Signs */}
            <Card style={styles.counterSignCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>🎭 Your Counter Signs</Text>
                <Text style={styles.counterSignDescription}>
                  Use these to identify each other at the restaurant
                </Text>
                
                <View style={styles.signContainer}>
                  <View style={styles.signBox}>
                    <Text style={styles.signLabel}>You say:</Text>
                    <Text style={styles.signText}>"{counterSign.user1Sign}"</Text>
                  </View>
                  
                  <Ionicons name="arrow-down" size={24} color={colors.primary} style={styles.arrowIcon} />
                  
                  <View style={styles.signBox}>
                    <Text style={styles.signLabel}>{matchedUser.name} responds:</Text>
                    <Text style={styles.signText}>"{counterSign.user2Sign}"</Text>
                  </View>
                </View>
                
                <View style={styles.signMeta}>
                  <Text style={styles.signSource}>From: {counterSign.source}</Text>
                  <Text style={styles.signInstructions}>{counterSign.instructions}</Text>
                </View>
              </Card.Content>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={proceedToReservation}
                style={styles.reservationButton}
                contentStyle={styles.buttonContent}
              >
                🍽️ Make Reservation
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => console.log('Open chat')}
                style={styles.chatButton}
                contentStyle={styles.buttonContent}
              >
                💬 Chat with {matchedUser.name}
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Dining Companions</Text>
        <Text style={styles.subtitle}>
          Connect with compatible foodies for your next meal
        </Text>
      </View>

      {!sessionActive && availableUsers.length === 0 && (
        <View style={styles.startContainer}>
          <Text style={styles.startEmoji}>🤝</Text>
          <Text style={styles.startTitle}>Ready to Meet Fellow Foodies?</Text>
          <Text style={styles.startDescription}>
            Start a 2-hour availability session to find compatible dining companions near you.
          </Text>
          
          <Button
            mode="contained"
            onPress={startMatching}
            style={styles.startButton}
            contentStyle={styles.buttonContent}
          >
            🔍 Start Matching
          </Button>
        </View>
      )}

      {availableUsers.length > 0 && (
        <ScrollView style={styles.usersList}>
          <Text style={styles.usersTitle}>Compatible Foodies Nearby</Text>
          
          {availableUsers.map((user) => (
            <Card key={user.id} style={styles.userCard}>
              <Card.Content>
                <View style={styles.userHeader}>
                  <Text style={styles.userAvatar}>{user.avatar}</Text>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{user.name}, {user.age}</Text>
                      {user.isOnline && (
                        <View style={styles.onlineIndicator}>
                          <Text style={styles.onlineText}>Online</Text>
                        </View>
                      )}
                    </View>
                    {renderCompatibilityScore(user.compatibilityScore)}
                  </View>
                </View>
                
                <Text style={styles.tagsTitle}>Food Personality</Text>
                <View style={styles.tagsContainer}>
                  {user.foodTags.map((tag, index) => (
                    <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                      {tag}
                    </Chip>
                  ))}
                </View>
                
                <Text style={styles.cuisinesTitle}>Preferred Cuisines</Text>
                <View style={styles.cuisinesContainer}>
                  {user.preferredCuisines.map((cuisine, index) => (
                    <Text key={index} style={styles.cuisineText}>{cuisine}</Text>
                  )).reduce((prev, curr, index) => [
                    ...prev,
                    index > 0 && <Text key={`sep-${index}`} style={styles.separator}> • </Text>,
                    curr
                  ], [] as React.ReactNode[])}
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => sendMatchRequest(user)}
                  style={styles.matchButton}
                  loading={selectedUser?.id === user.id}
                  disabled={selectedUser?.id === user.id}
                >
                  {selectedUser?.id === user.id ? 'Sending Request...' : '🤝 Send Match Request'}
                </Button>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
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
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  searchingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  searchingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  searchingTime: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 32,
  },
  cancelButton: {
    borderColor: colors.textSecondary,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  startEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  startDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
  },
  buttonContent: {
    height: 48,
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  usersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  userCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    fontSize: 48,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 12,
  },
  onlineIndicator: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  onlineText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  compatibilityContainer: {
    alignItems: 'flex-start',
  },
  compatibilityScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  compatibilityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tagChip: {
    backgroundColor: colors.primary + '15',
  },
  tagText: {
    fontSize: 11,
    color: colors.primary,
  },
  cuisinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  cuisinesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  cuisineText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  separator: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  matchButton: {
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  matchedContainer: {
    padding: 20,
    alignItems: 'center',
  },
  matchedEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  matchedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  matchedSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  matchedUserCard: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  matchedUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchedUserAvatar: {
    fontSize: 48,
    marginRight: 16,
  },
  matchedUserInfo: {
    flex: 1,
  },
  matchedUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: colors.success + '15',
  },
  interestText: {
    fontSize: 12,
    color: colors.success,
  },
  counterSignCard: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: colors.primary + '05',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  counterSignDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  signContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  signBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  signText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  arrowIcon: {
    marginVertical: 4,
  },
  signMeta: {
    alignItems: 'center',
  },
  signSource: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  signInstructions: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  reservationButton: {
    backgroundColor: colors.primary,
  },
  chatButton: {
    borderColor: colors.primary,
  },
});

export default MatchingScreen;