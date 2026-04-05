// Types and constants only — data is fetched from /api/contracts

export type ContractType = "pending" | "active" | "completed" | "cancelled";

export type PendingStatus = "no_response" | "in_negotiation" | "contract_sent";
export type ActiveStatus = "on_track" | "at_risk";
export type CancelledStatus = "cancelled_by_me" | "cancelled_by_client";

export type ContractStatus = PendingStatus | ActiveStatus | CancelledStatus;

export type DurationUnit = "days" | "weeks" | "months" | "years";

export type CompletionStatus = "on_time" | "over_time" | "under_time";

export interface ContractLink {
  id: string;
  name: string;
  url: string;
}

export interface Contract {
  id: string;
  client: string;
  title: string;
  description: string;
  workingHours: string;
  rating: number | null;
  positiveReviews: string;
  negativeReviews: string;
  currency: string;
  contractValue: string;
  valueInDiscussion: boolean;
  durationValue: string;
  durationUnit: DurationUnit;
  durationInDiscussion: boolean;
  completionStatus: CompletionStatus | null;
  type: ContractType;
  status: ContractStatus | null;
  proposedOn: string | null;
  startDate: string | null;
  endDate: string | null;
  cancelledDate: string | null;
  links: ContractLink[];
  notes: string;
  createdAt: string;
}

export interface TypeTransitionOptions {
  date?: string;
  contractValue?: string;
  currency?: string;
  valueInDiscussion?: boolean;
  durationValue?: string;
  durationUnit?: DurationUnit;
  durationInDiscussion?: boolean;
  completionStatus?: CompletionStatus | null;
}

export const PENDING_STATUSES: { value: PendingStatus; label: string }[] = [
  { value: "no_response", label: "No Response" },
  { value: "in_negotiation", label: "In Negotiation" },
  { value: "contract_sent", label: "Contract Sent" },
];

export const ACTIVE_STATUSES: { value: ActiveStatus; label: string }[] = [
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
];

export const CANCELLED_STATUSES: { value: CancelledStatus; label: string }[] = [
  { value: "cancelled_by_me", label: "Cancelled by Me" },
  { value: "cancelled_by_client", label: "Cancelled by Client" },
];

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const DURATION_UNITS: { value: DurationUnit; label: string }[] = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

export function durationToDays(value: string, unit: DurationUnit): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  if (unit === "days")   return n;
  if (unit === "weeks")  return n * 7;
  if (unit === "months") return n * 30;
  if (unit === "years")  return n * 365;
  return n;
}

export function calcCompletionStatus(
  startDate: string | null,
  endDate: string,
  durationValue: string,
  durationUnit: DurationUnit
): CompletionStatus | null {
  if (!startDate || !durationValue) return null;
  const planned = durationToDays(durationValue, durationUnit);
  if (planned <= 0) return null;
  const actual = Math.max(0, Math.floor(
    (new Date(endDate + "T00:00:00").getTime() - new Date(startDate + "T00:00:00").getTime()) / 86400000
  ));
  if (actual === planned) return "on_time";
  if (actual > planned)   return "over_time";
  return "under_time";
}

export const CONTRACT_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  [...PENDING_STATUSES, ...ACTIVE_STATUSES, ...CANCELLED_STATUSES].map((s) => [s.value, s.label])
);

export const CONTRACT_STATUS_BADGE_CLS: Record<string, string> = {
  no_response:          "bg-smoky4 text-smoky8",
  in_negotiation:       "bg-yellow100 text-yellow500",
  contract_sent:        "bg-blue50 text-blue700",
  on_track:             "bg-success/10 text-success",
  at_risk:              "bg-yellow100 text-yellow500",
  cancelled_by_me:      "bg-error/10 text-error",
  cancelled_by_client:  "bg-error/10 text-error",
};

export function formatDuration(value: string, unit: DurationUnit, inDiscussion: boolean): string {
  if (inDiscussion) return "In discussion";
  if (!value) return "—";
  const unit_label = value === "1" ? unit.replace(/s$/, "") : unit;
  return `${value} ${unit_label}`;
}
