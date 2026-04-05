// Types and constants only — data is fetched from /api/freelance

export type FreelanceType = "bidding" | "in_progress" | "completed" | "lost";

export type BiddingStatus    = "proposal_sent" | "awaiting_response" | "negotiating";
export type InProgressStatus = "on_track" | "revision_requested";
export type LostStatus       = "outbid" | "client_cancelled" | "ghosted";

export type FreelanceStatus = BiddingStatus | InProgressStatus | LostStatus;

export interface FreelanceLink {
  id: string;
  name: string;
  url: string;
}

export interface Freelance {
  id: string;
  client: string;
  title: string;
  description: string;
  rating: number | null;
  positiveReviews: string;
  negativeReviews: string;
  currency: string;
  hourlyRate: string;
  hoursPerDay: string;
  totalEarnings: string | null;
  type: FreelanceType;
  status: FreelanceStatus | null;
  bidDate: string | null;
  startDate: string | null;
  endDate: string | null;
  lostDate: string | null;
  links: FreelanceLink[];
  notes: string;
  createdAt: string;
}

export interface FreelanceTypeTransitionOptions {
  date?: string;
  currency?: string;
  hourlyRate?: string;
  hoursPerDay?: string;
  totalEarnings?: string | null;
}

export const BIDDING_STATUSES: { value: BiddingStatus; label: string }[] = [
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "awaiting_response", label: "Awaiting Response" },
  { value: "negotiating", label: "Negotiating" },
];

export const IN_PROGRESS_STATUSES: { value: InProgressStatus; label: string }[] = [
  { value: "on_track", label: "On Track" },
  { value: "revision_requested", label: "Revision Requested" },
];

export const LOST_STATUSES: { value: LostStatus; label: string }[] = [
  { value: "outbid", label: "Outbid" },
  { value: "client_cancelled", label: "Client Cancelled" },
  { value: "ghosted", label: "Ghosted" },
];

export const FREELANCE_TYPES: { value: FreelanceType; label: string }[] = [
  { value: "bidding", label: "Bidding" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "lost", label: "Lost" },
];

export const TYPE_BADGE_CLS: Record<FreelanceType, string> = {
  bidding:     "bg-yellow100 text-yellow500",
  in_progress: "bg-blue50 text-blue700",
  completed:   "bg-success/10 text-success",
  lost:        "bg-error/10 text-error",
};

export const FREELANCE_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  [...BIDDING_STATUSES, ...IN_PROGRESS_STATUSES, ...LOST_STATUSES].map((s) => [s.value, s.label])
);

export const FREELANCE_STATUS_BADGE_CLS: Record<string, string> = {
  proposal_sent:      "bg-blue50 text-blue700",
  awaiting_response:  "bg-yellow100 text-yellow500",
  negotiating:        "bg-smoky4 text-smoky8",
  on_track:           "bg-success/10 text-success",
  revision_requested: "bg-yellow100 text-yellow500",
  outbid:             "bg-error/10 text-error",
  client_cancelled:   "bg-error/10 text-error",
  ghosted:            "bg-smoky4 text-smoky7",
};

export function calcDuration(startDate: string | null, endDate: string | null): number | null {
  if (!startDate || !endDate) return null;
  return Math.max(0, Math.floor(
    (new Date(endDate + "T00:00:00").getTime() - new Date(startDate + "T00:00:00").getTime()) / 86400000
  ));
}

export function calcTotalEarnings(
  hourlyRate: string,
  hoursPerDay: string,
  startDate: string | null,
  endDate: string | null
): string | null {
  const rate  = parseFloat(hourlyRate.replace(/[^0-9.]/g, ""));
  const hours = parseFloat(hoursPerDay.replace(/[^0-9.]/g, ""));
  const days  = calcDuration(startDate, endDate);
  if (!rate || !hours || days === null) return null;
  const total = rate * hours * days;
  return total.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
