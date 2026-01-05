// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// User Types
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  phoneNumber?: string;
}

// Saved Location Types
export interface SavedLocationRequest {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address?: string;
}

export interface SavedLocationResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Trusted Contact Types
export interface TrustedContactRequest {
  name: string;
  phoneNumber: string;
  email?: string;
  priority: number;
  relationship?: string;
}

export interface TrustedContactResponse {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  priority: number;
  relationship?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Trip Types
export type TransportMode = 'WALKING' | 'BICYCLING' | 'DRIVING';
export type TripStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface StartTripRequest {
  destinationId: string;
  currentLatitude?: number;
  currentLongitude?: number;
  transportMode: TransportMode;
}

export interface TripResponse {
  id: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  destinationLatitude: number;
  destinationLongitude: number;
  startLatitude?: number;
  startLongitude?: number;
  transportMode: TransportMode;
  status: TripStatus;
  estimatedDistanceKm: number;
  estimatedTimeMinutes: number;
  startedAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  speed?: number;
}

export interface LocationUpdateResponse {
  tripId: string;
  distanceRemainingKm: number;
  estimatedTimeRemainingMinutes: number;
  onTrack: boolean;
  warningMessage?: string;
  updatedAt: string;
}

// Alert Types
export type AlertType = 'STOPPED' | 'DEVIATION' | 'DELAYED' | 'SOS' | 'CHECK_IN';
export type AlertStatus = 'PENDING' | 'RESPONDED' | 'ESCALATED';

export interface AlertResponse {
  id: string;
  tripId: string;
  type: AlertType;
  status: AlertStatus;
  message: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  respondedAt?: string;
  isOk?: boolean;
  responseMessage?: string;
}

export interface RespondToAlertRequest {
  isOk: boolean;
  message?: string;
}

// API Error
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
}
