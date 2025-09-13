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
import {
  Button,
  Card,
  TextInput,
  Chip,
  Modal,
  Portal,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  address: string;
  phone: string;
  image: string;
  availableSlots: TimeSlot[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  price?: number;
}

interface Reservation {
  id: string;
  restaurant: Restaurant;
  date: string;
  time: string;
  partySize: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  companion?: {
    name: string;
    avatar: string;
  };
  specialRequests?: string;
  confirmationCode: string;
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
    availableSlots: [
      { time: '6:00 PM', available: true, price: 45 },
      { time: '6:30 PM', available: true, price: 45 },
      { time: '7:00 PM', available: false },
      { time: '7:30 PM', available: true, price: 50 },
      { time: '8:00 PM', available: true, price: 50 },
      { time: '8:30 PM', available: true, price: 45 },
    ],
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
    availableSlots: [
      { time: '5:30 PM', available: true, price: 65 },
      { time: '6:00 PM', available: false },
      { time: '6:30 PM', available: true, price: 65 },
      { time: '7:00 PM', available: true, price: 70 },
      { time: '7:30 PM', available: false },
      { time: '8:00 PM', available: true, price: 70 },
    ],
  },
];

const mockReservations: Reservation[] = [
  {
    id: '1',
    restaurant: mockRestaurants[0],
    date: '2024-01-15',
    time: '7:30 PM',
    partySize: 2,
    status: 'confirmed',
    companion: {
      name: 'Alex',
      avatar: '👨‍🍳',
    },
    specialRequests: 'Window seat preferred',
    confirmationCode: 'HF2024-001',
  },
  {
    id: '2',
    restaurant: mockRestaurants[1],
    date: '2024-01-18',
    time: '6:30 PM',
    partySize: 2,
    status: 'pending',
    companion: {
      name: 'Sarah',
      avatar: '👩‍🌾',
    },
    confirmationCode: 'HF2024-002',
  },
];

const ReservationsScreen: React.FC = () => {
  const { width } = Dimensions.get('window');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'book'>('upcoming');
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const openBookingModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setBookingModalVisible(true);
    setSelectedTime('');
    setSpecialRequests('');
  };

  const closeBookingModal = () => {
    setBookingModalVisible(false);
    setSelectedRestaurant(null);
  };

  const confirmBooking = async () => {
    if (!selectedRestaurant || !selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    setIsBooking(true);

    // Simulate booking process
    setTimeout(() => {
      const newReservation: Reservation = {
        id: Date.now().toString(),
        restaurant: selectedRestaurant,
        date: selectedDate,
        time: selectedTime,
        partySize: parseInt(partySize),
        status: 'confirmed',
        specialRequests: specialRequests || undefined,
        confirmationCode: `HF2024-${String(reservations.length + 1).padStart(3, '0')}`,
      };

      setReservations(prev => [newReservation, ...prev]);
      setIsBooking(false);
      closeBookingModal();
      setActiveTab('upcoming');

      Alert.alert(
        '🎉 Reservation Confirmed!',
        `Your table at ${selectedRestaurant.name} is booked for ${selectedTime} on ${formatDate(selectedDate)}.\n\nConfirmation: ${newReservation.confirmationCode}`,
        [{ text: 'Great!', style: 'default' }]
      );
    }, 2000);
  };

  const cancelReservation = (reservationId: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setReservations(prev =>
              prev.map(res =>
                res.id === reservationId ? { ...res, status: 'cancelled' as const } : res
              )
            );
          },
        },
      ]
    );
  };

  const renderUpcomingReservations = () => {
    const upcomingReservations = reservations.filter(res => res.status !== 'cancelled');

    if (upcomingReservations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>No Upcoming Reservations</Text>
          <Text style={styles.emptyDescription}>
            Book your next dining experience with a companion!
          </Text>
          <Button
            mode="contained"
            onPress={() => setActiveTab('book')}
            style={styles.emptyButton}
          >
            Find Restaurants
          </Button>
        </View>
      );
    }

    return (
      <ScrollView style={styles.reservationsList}>
        {upcomingReservations.map((reservation) => (
          <Card key={reservation.id} style={styles.reservationCard}>
            <Card.Content>
              <View style={styles.reservationHeader}>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantEmoji}>{reservation.restaurant.image}</Text>
                  <View style={styles.restaurantDetails}>
                    <Text style={styles.restaurantName}>{reservation.restaurant.name}</Text>
                    <Text style={styles.restaurantCuisine}>{reservation.restaurant.cuisine}</Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <Ionicons
                    name={getStatusIcon(reservation.status)}
                    size={20}
                    color={getStatusColor(reservation.status)}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.reservationDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{formatDate(reservation.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{reservation.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="people" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{reservation.partySize} people</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{reservation.restaurant.address}</Text>
                </View>
              </View>

              {reservation.companion && (
                <View style={styles.companionContainer}>
                  <Text style={styles.companionLabel}>Dining with:</Text>
                  <View style={styles.companionInfo}>
                    <Text style={styles.companionAvatar}>{reservation.companion.avatar}</Text>
                    <Text style={styles.companionName}>{reservation.companion.name}</Text>
                  </View>
                </View>
              )}

              {reservation.specialRequests && (
                <View style={styles.requestsContainer}>
                  <Text style={styles.requestsLabel}>Special Requests:</Text>
                  <Text style={styles.requestsText}>{reservation.specialRequests}</Text>
                </View>
              )}

              <View style={styles.confirmationContainer}>
                <Text style={styles.confirmationLabel}>Confirmation Code:</Text>
                <Text style={styles.confirmationCode}>{reservation.confirmationCode}</Text>
              </View>

              {reservation.status === 'confirmed' && (
                <View style={styles.reservationActions}>
                  <Button
                    mode="outlined"
                    onPress={() => cancelReservation(reservation.id)}
                    style={styles.cancelButton}
                    textColor={colors.error}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => Alert.alert('Contact Restaurant', `Call ${reservation.restaurant.phone}`)}
                    style={styles.contactButton}
                  >
                    Contact Restaurant
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  const renderBookingTab = () => {
    return (
      <ScrollView style={styles.restaurantsList}>
        <Text style={styles.sectionTitle}>Available Restaurants</Text>
        {mockRestaurants.map((restaurant) => (
          <Card key={restaurant.id} style={styles.restaurantCard}>
            <Card.Content>
              <View style={styles.restaurantHeader}>
                <Text style={styles.restaurantEmoji}>{restaurant.image}</Text>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                  <View style={styles.restaurantMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={colors.warning} />
                      <Text style={styles.ratingText}>{restaurant.rating}</Text>
                    </View>
                    <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.addressText}>{restaurant.address}</Text>
              
              <Button
                mode="contained"
                onPress={() => openBookingModal(restaurant)}
                style={styles.bookButton}
              >
                📅 Book Table
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservations</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'book' && styles.activeTab]}
            onPress={() => setActiveTab('book')}
          >
            <Text style={[styles.tabText, activeTab === 'book' && styles.activeTabText]}>
              Book New
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'upcoming' ? renderUpcomingReservations() : renderBookingTab()}

      {/* Booking Modal */}
      <Portal>
        <Modal
          visible={bookingModalVisible}
          onDismiss={closeBookingModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            {selectedRestaurant && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Book Table</Text>
                  <TouchableOpacity onPress={closeBookingModal}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.restaurantSummary}>
                  <Text style={styles.restaurantEmoji}>{selectedRestaurant.image}</Text>
                  <View>
                    <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
                    <Text style={styles.restaurantCuisine}>{selectedRestaurant.cuisine}</Text>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Date</Text>
                  <TextInput
                    value={selectedDate}
                    onChangeText={setSelectedDate}
                    mode="outlined"
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Party Size</Text>
                  <RadioButton.Group
                    onValueChange={setPartySize}
                    value={partySize}
                  >
                    <View style={styles.radioContainer}>
                      {['1', '2', '3', '4', '5', '6+'].map((size) => (
                        <View key={size} style={styles.radioItem}>
                          <RadioButton value={size} />
                          <Text style={styles.radioLabel}>{size}</Text>
                        </View>
                      ))}
                    </View>
                  </RadioButton.Group>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Available Times</Text>
                  <View style={styles.timeSlotsContainer}>
                    {selectedRestaurant.availableSlots.map((slot, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeSlot,
                          !slot.available && styles.unavailableSlot,
                          selectedTime === slot.time && styles.selectedTimeSlot,
                        ]}
                        onPress={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                      >
                        <Text
                          style={[
                            styles.timeSlotText,
                            !slot.available && styles.unavailableText,
                            selectedTime === slot.time && styles.selectedTimeText,
                          ]}
                        >
                          {slot.time}
                        </Text>
                        {slot.price && (
                          <Text
                            style={[
                              styles.priceText,
                              !slot.available && styles.unavailableText,
                              selectedTime === slot.time && styles.selectedTimeText,
                            ]}
                          >
                            ${slot.price}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Special Requests (Optional)</Text>
                  <TextInput
                    value={specialRequests}
                    onChangeText={setSpecialRequests}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    placeholder="Any dietary restrictions, seating preferences, etc."
                    style={styles.requestsInput}
                  />
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={closeBookingModal}
                    style={styles.cancelModalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={confirmBooking}
                    loading={isBooking}
                    disabled={!selectedTime || isBooking}
                    style={styles.confirmButton}
                  >
                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </View>
              </>
            )}
          </ScrollView>
        </Modal>
      </Portal>
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
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: colors.primary,
  },
  reservationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reservationCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  restaurantEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  restaurantDetails: {
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
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  divider: {
    marginBottom: 16,
  },
  reservationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  companionContainer: {
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  companionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  companionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companionAvatar: {
    fontSize: 20,
    marginRight: 8,
  },
  companionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  requestsContainer: {
    marginBottom: 12,
  },
  requestsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  requestsText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  confirmationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  confirmationCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  reservationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.error,
  },
  contactButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  restaurantsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  restaurantCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  priceRange: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: colors.primary,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  restaurantSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: colors.background,
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unavailableSlot: {
    backgroundColor: colors.textSecondary + '20',
    borderColor: colors.textSecondary + '40',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedTimeText: {
    color: 'white',
  },
  unavailableText: {
    color: colors.textSecondary,
  },
  priceText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestsInput: {
    backgroundColor: colors.background,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelModalButton: {
    flex: 1,
    borderColor: colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});

export default ReservationsScreen;