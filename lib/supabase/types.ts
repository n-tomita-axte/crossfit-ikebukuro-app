export type Role = "member" | "coach" | "admin";
export type GenderDivision = "men" | "women" | null;
export type ScoreType = "weight" | "time" | "reps" | "rounds_reps" | "completion";
export type ScalingLevel = "RX" | "Scaled";

export interface Profile {
  id: string;
  display_name: string;
  gender_division: GenderDivision;
  role: Role;
  default_scaling: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Program {
  id: string;
  name: string;
  full_name: string;
  sort_order: number;
  active: boolean;
}

export interface Workout {
  id: string;
  program_id: string;
  date: string;
  title: string;
  body: string;
  score_type: ScoreType;
  scaling_levels: string[];
  sort_order: number;
  published: boolean;
  count_in_ranking: boolean;
  coach_note: string;
  coach_note_updated_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ResultRow {
  id: string;
  workout_id: string;
  user_id: string;
  score_value: number | null;
  score_secondary: number | null;
  completed: boolean | null;
  scaling: string | null;
  logged_date: string;
  created_at: string;
  updated_at: string;
}

export interface ResultWithProfile extends ResultRow {
  profiles: Pick<Profile, "display_name" | "gender_division" | "avatar_url"> | null;
}

export interface ResultCoachNote {
  result_id: string;
  user_id: string;
  note: string;
  updated_at: string;
}

export interface ResultPrivateNote {
  result_id: string;
  user_id: string;
  note: string;
  updated_at: string;
}

export interface WorkoutTemplate {
  id: string;
  program_id: string | null;
  name: string;
  title: string;
  body: string;
  score_type: ScoreType;
  scaling_levels: string[];
  count_in_ranking: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Handover {
  id: string;
  body: string;
  author_id: string | null;
  created_at: string;
  done: boolean;
  done_by: string | null;
  done_at: string | null;
}

export interface RoleChange {
  id: string;
  target_id: string;
  from_role: string;
  to_role: string;
  changed_by: string | null;
  changed_at: string;
}

export const SCORE_TYPE_LABEL: Record<ScoreType, string> = {
  weight: "重量 (kg)",
  time: "タイム",
  reps: "レップ数",
  rounds_reps: "ラウンド+レップ",
  completion: "完了/未完了",
};
