// Types and constants only — data is fetched from /api/jobs

export type JobType = "applied" | "working" | "left" | "rejected";

export type AppliedStatus =
  | "no_callback"
  | "callback"
  | "interview_scheduled"
  | "post_interview";

export type WorkingStatus = "comfortable" | "planning_to_switch";

export type RejectedStatus = "rejected_by_me" | "rejected_by_company";

export type JobStatus = AppliedStatus | WorkingStatus | RejectedStatus;

export interface JobLink {
  id: string;
  name: string;
  url: string;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  description: string;
  workingHours: string;
  rating: number | null;
  positiveReviews: string;
  negativeReviews: string;
  currency: string;
  expectedPackage: string;
  salaryInDiscussion: boolean;
  type: JobType;
  status: JobStatus | null;
  appliedOn: string | null;
  startDate: string | null;
  endDate: string | null;
  rejectedDate: string | null;
  links: JobLink[];
  notes: string;
  createdAt: string;
}

export interface JobTypeTransitionOptions {
  date?: string;
  expectedPackage?: string;
  currency?: string;
  salaryInDiscussion?: boolean;
}

export const WORKING_STATUSES: { value: WorkingStatus; label: string }[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "planning_to_switch", label: "Planning to Switch" },
];

export const APPLIED_STATUSES: { value: AppliedStatus; label: string }[] = [
  { value: "no_callback", label: "No Callback" },
  { value: "callback", label: "Callback" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "post_interview", label: "Post Interview" },
];

export const REJECTED_STATUSES: { value: RejectedStatus; label: string }[] = [
  { value: "rejected_by_me", label: "Rejected by Me" },
  { value: "rejected_by_company", label: "Rejected by Company" },
];

export const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "working", label: "Working" },
  { value: "left", label: "Left" },
  { value: "rejected", label: "Rejected" },
];

export const TYPE_DATE_LABEL: Partial<Record<JobType, string>> = {
  working: "Start Date",
  left: "End Date",
  rejected: "Rejected Date",
};

export const JOB_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  [...APPLIED_STATUSES, ...WORKING_STATUSES, ...REJECTED_STATUSES].map((s) => [s.value, s.label])
);

export const JOB_STATUS_BADGE_CLS: Record<string, string> = {
  no_callback:         "bg-smoky4 text-smoky8",
  callback:            "bg-yellow100 text-yellow500",
  interview_scheduled: "bg-blue50 text-blue700",
  post_interview:      "bg-success/10 text-success",
  comfortable:         "bg-success/10 text-success",
  planning_to_switch:  "bg-yellow100 text-yellow500",
  rejected_by_me:      "bg-error/10 text-error",
  rejected_by_company: "bg-error/10 text-error",
};
