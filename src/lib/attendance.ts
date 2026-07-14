export type AttendanceStatus = "PRESENT" | "ABSENT" | "CANCELLED";

export interface AttendanceStats {
  attended: number;
  totalHeld: number; // excludes cancelled
  percent: number;
  target: number;
  /** How many more classes in a row can be skipped and still hit target. 0 if already below target. */
  safeBunks: number;
  /** How many more classes in a row must be attended to reach target. 0 if already at/above target. */
  classesRequired: number;
  status: "safe" | "warning" | "danger";
}

/**
 * Given attended/held counts, compute safe bunks and classes required to hit a target %.
 *
 * Safe bunks: largest n such that attended / (totalHeld + n) >= target/100
 * Classes required: smallest n such that (attended + n) / (totalHeld + n) >= target/100
 */
export function calculateAttendanceStats(
  attended: number,
  totalHeld: number,
  target: number = 75
): AttendanceStats {
  const percent = totalHeld > 0 ? (attended / totalHeld) * 100 : 0;
  const targetFraction = target / 100;

  let safeBunks = 0;
  let classesRequired = 0;

  if (totalHeld === 0) {
    return {
      attended,
      totalHeld,
      percent: 0,
      target,
      safeBunks: 0,
      classesRequired: 0,
      status: "warning",
    };
  }

  if (percent >= target) {
    // safeBunks: max n where attended / (totalHeld + n) >= targetFraction
    // attended >= targetFraction * (totalHeld + n)
    // attended / targetFraction - totalHeld >= n
    if (targetFraction > 0) {
      safeBunks = Math.max(
        0,
        Math.floor(attended / targetFraction - totalHeld)
      );
    }
  } else {
    // classesRequired: min n where (attended + n) / (totalHeld + n) >= targetFraction
    // attended + n >= targetFraction * (totalHeld + n)
    // n - targetFraction * n >= targetFraction * totalHeld - attended
    // n * (1 - targetFraction) >= targetFraction * totalHeld - attended
    if (targetFraction < 1) {
      const numerator = targetFraction * totalHeld - attended;
      classesRequired = Math.max(
        0,
        Math.ceil(numerator / (1 - targetFraction))
      );
    }
  }

  const status: AttendanceStats["status"] =
    percent >= target ? "safe" : percent >= target - 10 ? "warning" : "danger";

  return {
    attended,
    totalHeld,
    percent: Math.round(percent * 10) / 10,
    target,
    safeBunks,
    classesRequired,
    status,
  };
}

export function statusToBadgeVariant(status: AttendanceStats["status"]) {
  if (status === "safe") return "success" as const;
  if (status === "warning") return "warning" as const;
  return "destructive" as const;
}
