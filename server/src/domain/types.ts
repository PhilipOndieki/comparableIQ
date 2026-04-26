export enum UserRole {
  ADMIN = 'ADMIN',
  VERIFIED_VALUER = 'VERIFIED_VALUER',
  GOOGLE_USER = 'GOOGLE_USER',
}

export enum AuditAction {
  SEARCH = 'SEARCH',
  VIEW_RESULT = 'VIEW_RESULT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  COMPARABLE_ADDED = 'COMPARABLE_ADDED',
  COMPARABLE_EDITED = 'COMPARABLE_EDITED',
  COMPARABLE_DELETED = 'COMPARABLE_DELETED',
  USER_UPGRADED = 'USER_UPGRADED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  MAP_ACCESS_TOGGLED = 'MAP_ACCESS_TOGGLED',
}

export interface User {
  id: string;
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  searchCountToday: number;
  searchCountResetAt: Date;
  hasMapAccess: boolean;
  isActive: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comparable {
  id: string;
  parcelNumber: string;
  areaHa: number;
  salePrice: number | null;
  pricePerHa: number | null;
  saleDate: Date;
  locality: string;
  county: string;
  notes: string | null;
  coordinates: [number, number]; // [lng, lat]
  distanceM?: number;
  hidden: boolean;
}

export interface SearchParams {
  lat: number;
  lng: number;
  areaHa: number;
  radiusKm: number;
  parcelNumber?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: {
    requestId: string;
    tookMs: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface ParcelLookupResult {
  areaHa: number;
  lat: number;
  lng: number;
}

export interface SearchResult {
  comparables: Comparable[];
  total: number;
  hidden: boolean;
}

export interface DashboardStats {
  totalComparables: number;
  searchesToday: number;
  searchesYesterday: number;
  newSigninsToday: number;
  limitHitsToday: number;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userDisplayName: string | null;
  action: AuditAction;
  metadata: Record<string, unknown>;
  ipAddress: string;
  createdAt: Date;
}
