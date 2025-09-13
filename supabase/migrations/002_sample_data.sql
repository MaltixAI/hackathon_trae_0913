-- Insert sample restaurants
INSERT INTO public.restaurants (name, cuisine, rating, price_range, address, phone, image_url, location, available_slots) VALUES
(
  'Spice Garden Thai',
  'Thai',
  4.8,
  '$$',
  '123 Main St, Downtown',
  '(555) 123-4567',
  '🌶️',
  '{"latitude": 37.7749, "longitude": -122.4194, "city": "San Francisco"}',
  '[
    {"time": "6:00 PM", "available": true, "price": 45},
    {"time": "6:30 PM", "available": true, "price": 45},
    {"time": "7:00 PM", "available": false},
    {"time": "7:30 PM", "available": true, "price": 50},
    {"time": "8:00 PM", "available": true, "price": 50},
    {"time": "8:30 PM", "available": true, "price": 45}
  ]'
),
(
  'Bella Vista Italian',
  'Italian',
  4.6,
  '$$$',
  '456 Oak Ave, Midtown',
  '(555) 987-6543',
  '🍝',
  '{"latitude": 37.7849, "longitude": -122.4094, "city": "San Francisco"}',
  '[
    {"time": "5:30 PM", "available": true, "price": 65},
    {"time": "6:00 PM", "available": false},
    {"time": "6:30 PM", "available": true, "price": 65},
    {"time": "7:00 PM", "available": true, "price": 70},
    {"time": "7:30 PM", "available": false},
    {"time": "8:00 PM", "available": true, "price": 70}
  ]'
),
(
  'Sakura Sushi Bar',
  'Japanese',
  4.9,
  '$$$',
  '789 Pine St, Japantown',
  '(555) 456-7890',
  '🍣',
  '{"latitude": 37.7849, "longitude": -122.4294, "city": "San Francisco"}',
  '[
    {"time": "5:00 PM", "available": true, "price": 80},
    {"time": "5:30 PM", "available": true, "price": 80},
    {"time": "6:00 PM", "available": true, "price": 85},
    {"time": "6:30 PM", "available": false},
    {"time": "7:00 PM", "available": true, "price": 85},
    {"time": "7:30 PM", "available": true, "price": 80}
  ]'
),
(
  'Taco Libre Mexican',
  'Mexican',
  4.4,
  '$',
  '321 Mission St, Mission District',
  '(555) 234-5678',
  '🌮',
  '{"latitude": 37.7649, "longitude": -122.4194, "city": "San Francisco"}',
  '[
    {"time": "6:00 PM", "available": true, "price": 25},
    {"time": "6:30 PM", "available": true, "price": 25},
    {"time": "7:00 PM", "available": true, "price": 30},
    {"time": "7:30 PM", "available": true, "price": 30},
    {"time": "8:00 PM", "available": false},
    {"time": "8:30 PM", "available": true, "price": 25}
  ]'
),
(
  'Le Petit Bistro',
  'French',
  4.7,
  '$$$$',
  '567 Union Square, Downtown',
  '(555) 345-6789',
  '🥐',
  '{"latitude": 37.7879, "longitude": -122.4074, "city": "San Francisco"}',
  '[
    {"time": "5:30 PM", "available": true, "price": 95},
    {"time": "6:00 PM", "available": true, "price": 95},
    {"time": "6:30 PM", "available": false},
    {"time": "7:00 PM", "available": true, "price": 105},
    {"time": "7:30 PM", "available": true, "price": 105},
    {"time": "8:00 PM", "available": false}
  ]'
),
(
  'Mumbai Spice House',
  'Indian',
  4.5,
  '$$',
  '890 Geary Blvd, Tenderloin',
  '(555) 567-8901',
  '🍛',
  '{"latitude": 37.7849, "longitude": -122.4194, "city": "San Francisco"}',
  '[
    {"time": "6:00 PM", "available": true, "price": 40},
    {"time": "6:30 PM", "available": true, "price": 40},
    {"time": "7:00 PM", "available": true, "price": 45},
    {"time": "7:30 PM", "available": false},
    {"time": "8:00 PM", "available": true, "price": 45},
    {"time": "8:30 PM", "available": true, "price": 40}
  ]'
),
(
  'Golden Dragon Chinese',
  'Chinese',
  4.3,
  '$$',
  '234 Grant Ave, Chinatown',
  '(555) 678-9012',
  '🥟',
  '{"latitude": 37.7949, "longitude": -122.4074, "city": "San Francisco"}',
  '[
    {"time": "5:30 PM", "available": true, "price": 35},
    {"time": "6:00 PM", "available": true, "price": 35},
    {"time": "6:30 PM", "available": true, "price": 40},
    {"time": "7:00 PM", "available": true, "price": 40},
    {"time": "7:30 PM", "available": false},
    {"time": "8:00 PM", "available": true, "price": 35}
  ]'
),
(
  'Seoul Kitchen',
  'Korean',
  4.6,
  '$$',
  '678 Irving St, Sunset District',
  '(555) 789-0123',
  '🍜',
  '{"latitude": 37.7649, "longitude": -122.4694, "city": "San Francisco"}',
  '[
    {"time": "6:00 PM", "available": true, "price": 42},
    {"time": "6:30 PM", "available": false},
    {"time": "7:00 PM", "available": true, "price": 47},
    {"time": "7:30 PM", "available": true, "price": 47},
    {"time": "8:00 PM", "available": true, "price": 42},
    {"time": "8:30 PM", "available": true, "price": 42}
  ]'
),
(
  'Mediterranean Breeze',
  'Mediterranean',
  4.4,
  '$$',
  '345 Valencia St, Mission District',
  '(555) 890-1234',
  '🫒',
  '{"latitude": 37.7649, "longitude": -122.4214, "city": "San Francisco"}',
  '[
    {"time": "5:30 PM", "available": true, "price": 38},
    {"time": "6:00 PM", "available": true, "price": 38},
    {"time": "6:30 PM", "available": true, "price": 43},
    {"time": "7:00 PM", "available": false},
    {"time": "7:30 PM", "available": true, "price": 43},
    {"time": "8:00 PM", "available": true, "price": 38}
  ]'
),
(
  'Fusion Lab',
  'Fusion',
  4.8,
  '$$$',
  '901 Fillmore St, Pacific Heights',
  '(555) 901-2345',
  '🧪',
  '{"latitude": 37.7879, "longitude": -122.4324, "city": "San Francisco"}',
  '[
    {"time": "6:00 PM", "available": true, "price": 75},
    {"time": "6:30 PM", "available": true, "price": 75},
    {"time": "7:00 PM", "available": false},
    {"time": "7:30 PM", "available": true, "price": 85},
    {"time": "8:00 PM", "available": true, "price": 85},
    {"time": "8:30 PM", "available": false}
  ]'
);