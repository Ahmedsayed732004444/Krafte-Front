import type { BookingStatus } from "@/features/bookings/types/bookings";

export interface DailyReportResponse {
  date: string;
  newBookings: number;
  pickedUpToday: number;
  returnedToday: number;
  cancelledToday: number;
  revenueCollectedToday: number;
  pendingRevenue: number;
  damageFeesCollected: number;
  currentlyActive: number;
  currentlyPickedUp: number;
  overdueCount: number;
}

export interface DaySnapshot {
  dayName: string;
  date: string;
  bookingsCount: number;
  revenue: number;
}

export interface WeeklyReportResponse {
  weekStart: string;
  weekEnd: string;
  dailyBreakdown: DaySnapshot[];
  totalBookings: number;
  totalRevenue: number;
  busiestDay: string;
}

export interface MonthlyReportResponse {
  year: number;
  month: number;
  monthName: string;
  totalBookings: number;
  activeBookings: number;
  pickedUpBookings: number;
  returnedBookings: number;
  cancelledBookings: number;
  grossRevenue: number;
  netRevenue: number;
  actualCollected: number;
  totalDiscountsGiven: number;
  totalDamageFees: number;
  totalDepositsHeld: number;
  outstandingBalance: number;
  revenueChangePercent: number;
  bookingsChangePercent: number;
  topSuitSize: string | null;
  newCustomers: number;
}

export interface MonthSnapshot {
  month: number;
  monthName: string;
  bookingsCount: number;
  revenue: number;
  newCustomers: number;
}

export interface AnnualReportResponse {
  year: number;
  monthlyBreakdown: MonthSnapshot[];
  totalBookings: number;
  totalRevenue: number;
  peakMonth: string;
  slowestMonth: string;
  yearOverYearGrowthPercent: number;
  totalNewCustomers: number;
  totalDamagedSuits: number;
}

export interface SuitSizeStats {
  rank: number;
  size: string;
  totalBookings: number;
  activeNow: number;
  availableHangers: number;
  utilizationRate: number;
  revenueGenerated: number;
}

export interface SuitSizeRankingResponse {
  rankings: SuitSizeStats[];
  mostDemanded: string;
  leastDemanded: string;
  fromDate: string | null;
  toDate: string | null;
}

export interface SuitSizeAvailability {
  size: string;
  totalHangers: number;
  bookedNow: number;
  available: number;
  availabilityPercent: number;
  stockStatus: "Low" | "Normal" | "High";
}

export interface SuitSizeAvailabilityResponse {
  sizes: SuitSizeAvailability[];
}

export interface HangerUtilizationStats {
  rank: number;
  hangerId: string;
  hangerNumber: number;
  partitionName: string;
  totalBookings: number;
  daysBooked: number;
  utilizationRate: number;
  revenueGenerated: number;
  isCurrentlyBooked: boolean;
}

export interface HangerUtilizationResponse {
  rankings: HangerUtilizationStats[];
  partitionId: string;
  partitionName: string;
}

export interface PartitionPerformanceStats {
  rank: number;
  partitionId: string;
  partitionName: string;
  totalHangers: number;
  totalBookings: number;
  totalRevenue: number;
  avgRevenuePerBooking: number;
  utilizationRate: number;
  currentlyBooked: number;
}

export interface PartitionPerformanceResponse {
  rankings: PartitionPerformanceStats[];
}

export interface RevenueBreakdownResponse {
  fromDate: string | null;
  toDate: string | null;
  grossRevenue: number;
  netRevenue: number;
  actualCollected: number;
  totalDiscounts: number;
  totalDamageFees: number;
  totalDeductions: number;
  outstandingBalance: number;
  totalBookings: number;
  bookingsWithDiscount: number;
  averageBookingValue: number;
}

export interface PendingPaymentItem {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  status: BookingStatus;
  totalAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  fromDate: string;
  toDate: string;
  daysUntilDue: number;
}

export interface PendingPaymentsResponse {
  items: PendingPaymentItem[];
  totalPending: number;
  totalCount: number;
}

export interface AccessoryColorStat {
  colorName: string;
  count: number;
  percentage: number;
}

export interface ShirtSizeStat {
  sizeName: string;
  count: number;
  percentage: number;
}

export interface TrouserSizeStat {
  waistSize: number;
  count: number;
  percentage: number;
}

export interface AccessoryPreferencesResponse {
  gravataColors: AccessoryColorStat[];
  vestColors: AccessoryColorStat[];
  trouserColors: AccessoryColorStat[];
  shirtColors: AccessoryColorStat[];
  shirtSizes: ShirtSizeStat[];
  trouserWaistSizes: TrouserSizeStat[];
}

export interface DayOfWeekStat {
  dayName: string;
  bookingsCount: number;
  percentage: number;
}

export interface MonthlyPeakStat {
  monthName: string;
  month: number;
  bookingsCount: number;
  percentage: number;
}

export interface PeakTimesResponse {
  byDayOfWeek: DayOfWeekStat[];
  byMonth: MonthlyPeakStat[];
  busiestDayOfWeek: string;
  busiestMonth: string;
}

export interface RetentionTierStat {
  tier: string;
  count: number;
  percentage: number;
  avgRevenue: number;
}

export interface CustomerRetentionResponse {
  totalCustomers: number;
  returningCustomers: number;
  oneTimeCustomers: number;
  retentionRate: number;
  vipCount: number;
  regularCount: number;
  atRiskCount: number;
  newCount: number;
  tierBreakdown: RetentionTierStat[];
}

export interface RiskMonthStat {
  year: number;
  month: number;
  monthName: string;
  count: number;
  amount: number;
}

export interface RiskReportResponse {
  totalDamagedBookings: number;
  totalDamageFeesCollected: number;
  avgDamageAmount: number;
  totalCancelledBookings: number;
  overallCancellationRate: number;
  damageByMonth: RiskMonthStat[];
  cancellationByMonth: RiskMonthStat[];
}

export interface MostRequestedSuitItem {
  rank: number;
  partitionId: string;
  partitionName: string;
  hangerId: string;
  hangerNumber: number;
  suitSize: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  revenueGenerated: number;
  lastBookedAt: string | null;
}

export interface MostRequestedSuitsResponse {
  items: MostRequestedSuitItem[];
  topHangerNumber: number | null;
  topPartitionName: string | null;
  from: string | null;
  to: string | null;
}
