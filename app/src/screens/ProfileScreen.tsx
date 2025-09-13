import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Button,
  Card,
  TextInput,
  Switch,
  Chip,
  Avatar,
  Divider,
  List,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

interface UserProfile {
  name: string;
  email: string;
  age: number;
  avatar: string;
  bio: string;
  foodTags: string[];
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  notifications: {
    matches: boolean;
    reservations: boolean;
    promotions: boolean;
  };
  privacy: {
    showAge: boolean;
    showLocation: boolean;
    allowMatching: boolean;
  };
}

const availableFoodTags = [
  'Spice Warrior', 'Sweet Tooth', 'Health Conscious', 'Adventure Seeker',
  'Fine Dining', 'Street Food Lover', 'Organic Lover', 'Wine Enthusiast',
  'Creative Eater', 'Instagram Foodie', 'Fusion Lover', 'Classic Tastes',
  'Comfort Food', 'Exotic Explorer', 'Local Favorite', 'Seasonal Eater'
];

const availableCuisines = [
  'Italian', 'Thai', 'Mexican', 'Japanese', 'Indian', 'Chinese',
  'French', 'Mediterranean', 'Korean', 'Vietnamese', 'American',
  'Greek', 'Spanish', 'Lebanese', 'Ethiopian', 'Fusion'
];

const availableDietaryRestrictions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
  'Halal', 'Kosher', 'Keto', 'Paleo', 'Low-Sodium'
];

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Jamie Chen',
    email: 'jamie.chen@email.com',
    age: 28,
    avatar: '👨‍🍳',
    bio: 'Food enthusiast who loves exploring new cuisines and meeting fellow foodies!',
    foodTags: ['Spice Warrior', 'Adventure Seeker', 'Instagram Foodie'],
    dietaryRestrictions: ['Vegetarian'],
    preferredCuisines: ['Thai', 'Italian', 'Japanese', 'Fusion'],
    notifications: {
      matches: true,
      reservations: true,
      promotions: false,
    },
    privacy: {
      showAge: true,
      showLocation: true,
      allowMatching: true,
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    Alert.alert('Success', 'Your profile has been updated!');
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const toggleFoodTag = (tag: string) => {
    setEditedProfile(prev => ({
      ...prev,
      foodTags: prev.foodTags.includes(tag)
        ? prev.foodTags.filter(t => t !== tag)
        : [...prev.foodTags, tag]
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setEditedProfile(prev => ({
      ...prev,
      preferredCuisines: prev.preferredCuisines.includes(cuisine)
        ? prev.preferredCuisines.filter(c => c !== cuisine)
        : [...prev.preferredCuisines, cuisine]
    }));
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setEditedProfile(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  const updateNotificationSetting = (key: keyof UserProfile['notifications'], value: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updatePrivacySetting = (key: keyof UserProfile['privacy'], value: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const renderBasicInfo = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{isEditing ? editedProfile.avatar : profile.avatar}</Text>
          <View style={styles.avatarInfo}>
            {isEditing ? (
              <TextInput
                value={editedProfile.name}
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, name: text }))}
                mode="outlined"
                label="Name"
                style={styles.nameInput}
              />
            ) : (
              <Text style={styles.userName}>{profile.name}</Text>
            )}
            <Text style={styles.userEmail}>{profile.email}</Text>
          </View>
        </View>

        {isEditing ? (
          <TextInput
            value={editedProfile.bio}
            onChangeText={(text) => setEditedProfile(prev => ({ ...prev, bio: text }))}
            mode="outlined"
            label="Bio"
            multiline
            numberOfLines={3}
            style={styles.bioInput}
          />
        ) : (
          <Text style={styles.userBio}>{profile.bio}</Text>
        )}

        {isEditing && (
          <View style={styles.editActions}>
            <Button mode="outlined" onPress={handleCancel} style={styles.cancelButton}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
              Save Changes
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderFoodPreferences = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Food Personality</Text>
        <Text style={styles.sectionDescription}>
          Select tags that describe your food preferences
        </Text>
        
        <View style={styles.tagsContainer}>
          {availableFoodTags.map((tag) => {
            const isSelected = (isEditing ? editedProfile : profile).foodTags.includes(tag);
            return (
              <Chip
                key={tag}
                selected={isSelected}
                onPress={isEditing ? () => toggleFoodTag(tag) : undefined}
                style={[
                  styles.tagChip,
                  isSelected && styles.selectedChip,
                  !isEditing && styles.disabledChip
                ]}
                textStyle={[
                  styles.tagText,
                  isSelected && styles.selectedTagText
                ]}
              >
                {tag}
              </Chip>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );

  const renderCuisinePreferences = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Preferred Cuisines</Text>
        <Text style={styles.sectionDescription}>
          Choose your favorite types of cuisine
        </Text>
        
        <View style={styles.tagsContainer}>
          {availableCuisines.map((cuisine) => {
            const isSelected = (isEditing ? editedProfile : profile).preferredCuisines.includes(cuisine);
            return (
              <Chip
                key={cuisine}
                selected={isSelected}
                onPress={isEditing ? () => toggleCuisine(cuisine) : undefined}
                style={[
                  styles.cuisineChip,
                  isSelected && styles.selectedChip,
                  !isEditing && styles.disabledChip
                ]}
                textStyle={[
                  styles.tagText,
                  isSelected && styles.selectedTagText
                ]}
              >
                {cuisine}
              </Chip>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );

  const renderDietaryRestrictions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
        <Text style={styles.sectionDescription}>
          Let others know about your dietary needs
        </Text>
        
        <View style={styles.tagsContainer}>
          {availableDietaryRestrictions.map((restriction) => {
            const isSelected = (isEditing ? editedProfile : profile).dietaryRestrictions.includes(restriction);
            return (
              <Chip
                key={restriction}
                selected={isSelected}
                onPress={isEditing ? () => toggleDietaryRestriction(restriction) : undefined}
                style={[
                  styles.restrictionChip,
                  isSelected && styles.selectedChip,
                  !isEditing && styles.disabledChip
                ]}
                textStyle={[
                  styles.tagText,
                  isSelected && styles.selectedTagText
                ]}
              >
                {restriction}
              </Chip>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <List.Item
          title="Match Notifications"
          description="Get notified when someone wants to dine with you"
          left={() => <Ionicons name="people" size={24} color={colors.primary} />}
          right={() => (
            <Switch
              value={editedProfile.notifications.matches}
              onValueChange={(value) => updateNotificationSetting('matches', value)}
            />
          )}
        />
        
        <List.Item
          title="Reservation Updates"
          description="Confirmations, reminders, and changes"
          left={() => <Ionicons name="calendar" size={24} color={colors.primary} />}
          right={() => (
            <Switch
              value={editedProfile.notifications.reservations}
              onValueChange={(value) => updateNotificationSetting('reservations', value)}
            />
          )}
        />
        
        <List.Item
          title="Promotions & Offers"
          description="Special deals from restaurants"
          left={() => <Ionicons name="pricetag" size={24} color={colors.primary} />}
          right={() => (
            <Switch
              value={editedProfile.notifications.promotions}
              onValueChange={(value) => updateNotificationSetting('promotions', value)}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <List.Item
          title="Show Age"
          description="Display your age on your profile"
          left={() => <Ionicons name="person" size={24} color={colors.primary} />}
          right={() => (
            <Switch
              value={editedProfile.privacy.showAge}
              onValueChange={(value) => updatePrivacySetting('showAge', value)}
            />
          )}
        />
        
        <List.Item
          title="Show Location"
          description="Allow others to see your general location"
          left={() => <Ionicons name="location" size={24} color={colors.primary} />}
          right={() => (
            <Switch
              value={editedProfile.privacy.showLocation}
              onValueChange={(value) => updatePrivacySetting('showLocation', value)}
            />
          )}
        />
        
        <List.Item
          title="Allow Matching"
          description="Enable companion matching feature"
          left={() => <Ionicons name="heart" size={24} color={colors.primary} />}
          right={() => (
            <Switch
              value={editedProfile.privacy.allowMatching}
              onValueChange={(value) => updatePrivacySetting('allowMatching', value)}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const renderAccountActions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <List.Item
          title="Change Password"
          left={() => <Ionicons name="lock-closed" size={24} color={colors.textSecondary} />}
          right={() => <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
          onPress={() => Alert.alert('Change Password', 'This feature will be available soon.')}
        />
        
        <List.Item
          title="Export Data"
          left={() => <Ionicons name="download" size={24} color={colors.textSecondary} />}
          right={() => <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
          onPress={() => Alert.alert('Export Data', 'Your data export will be ready shortly.')}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Delete Account"
          titleStyle={{ color: colors.error }}
          left={() => <Ionicons name="trash" size={24} color={colors.error} />}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') }
              ]
            );
          }}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {isEditing && (
          <Text style={styles.editingIndicator}>Editing Mode</Text>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderBasicInfo()}
        {renderFoodPreferences()}
        {renderCuisinePreferences()}
        {renderDietaryRestrictions()}
        {renderNotificationSettings()}
        {renderPrivacySettings()}
        {renderAccountActions()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Happy Foodie v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for food lovers</Text>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  editingIndicator: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 64,
    marginRight: 16,
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userBio: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  nameInput: {
    backgroundColor: colors.background,
    marginBottom: 8,
  },
  bioInput: {
    backgroundColor: colors.background,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cuisineChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  restrictionChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabledChip: {
    opacity: 0.7,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
  },
  selectedTagText: {
    color: 'white',
  },
  divider: {
    marginVertical: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});

export default ProfileScreen;