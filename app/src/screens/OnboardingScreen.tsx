import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, TextInput, Card, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/theme';

const OnboardingScreen: React.FC = () => {
  const { width, height } = Dimensions.get('window');
  const navigation = useNavigation();
  const { signUp, signIn, loading, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleAuth = async () => {
    if (isSignUp) {
      if (!name.trim() || !email.trim() || !password.trim() || !age.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const { success, error } = await signUp(email, password, {
        name: name.trim(),
        age: parseInt(age),
        bio: 'Food enthusiast ready to explore!',
        food_tags: [],
        dietary_restrictions: [],
        preferred_cuisines: [],
      });

      if (success) {
        Alert.alert('Success', 'Account created! Please check your email to verify your account.');
      } else {
        Alert.alert('Error', error || 'Failed to create account');
      }
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Error', 'Please enter email and password');
        return;
      }

      const { success, error } = await signIn(email, password);
      if (!success) {
        Alert.alert('Error', error || 'Failed to sign in');
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    // For demo purposes, directly navigate to food tagging
    navigation.navigate('FoodTagging' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>🍽️</Text>
            <Text style={styles.title}>Welcome to Happy Foodie!</Text>
            <Text style={styles.subtitle}>
              Discover amazing restaurants and connect with fellow food lovers
            </Text>
          </View>

          <Card style={styles.authCard}>
            <Card.Content>
              <View style={styles.authToggle}>
                <Button
                  mode={isSignUp ? 'contained' : 'outlined'}
                  onPress={() => setIsSignUp(true)}
                  style={[styles.toggleButton, isSignUp && styles.activeToggle]}
                  compact
                >
                  Sign Up
                </Button>
                <Button
                  mode={!isSignUp ? 'contained' : 'outlined'}
                  onPress={() => setIsSignUp(false)}
                  style={[styles.toggleButton, !isSignUp && styles.activeToggle]}
                  compact
                >
                  Sign In
                </Button>
              </View>

              <View style={styles.form}>
                {isSignUp && (
                  <>
                    <TextInput
                      label="Your Name"
                      value={name}
                      onChangeText={setName}
                      mode="outlined"
                      style={styles.input}
                      placeholder="Enter your name"
                    />
                    
                    <TextInput
                      label="Age"
                      value={age}
                      onChangeText={setAge}
                      mode="outlined"
                      style={styles.input}
                      placeholder="Enter your age"
                      keyboardType="numeric"
                    />
                  </>
                )}
                
                <TextInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry
                />
              </View>

              <Button
                mode="contained"
                onPress={handleAuth}
                style={styles.authButton}
                contentStyle={styles.buttonContent}
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </Card.Content>
          </Card>
        </View>
      </KeyboardAvoidingView>
      
      <Snackbar
        visible={showError}
        onDismiss={() => {
          setShowError(false);
          clearError();
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
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  authCard: {
    backgroundColor: colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  authToggle: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  authButton: {
    backgroundColor: colors.primary,
  },
  buttonContent: {
    height: 48,
  },
  errorSnackbar: {
    backgroundColor: colors.error,
    marginBottom: 20,
  },
});

export default OnboardingScreen;