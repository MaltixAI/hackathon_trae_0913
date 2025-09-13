import { DefaultTheme } from 'react-native-paper';

export const colors = {
  primary: '#ff9e01',
  background: '#FFF8E7',
  surface: '#FFFFFF',
  text: '#2C2C2C',
  textSecondary: '#666666',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
};