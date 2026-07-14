// Placeholder/mock data for the Dashboard UI.
// Real data wiring (attendance engine, notes DB, etc.) comes in later prompts.

export const mockAttendance = {
  overall: 78,
  subjects: [
    { name: "Data Structures", attended: 34, total: 40, percent: 85 },
    { name: "Operating Systems", attended: 28, total: 38, percent: 74 },
    { name: "DBMS", attended: 30, total: 36, percent: 83 },
    { name: "Computer Networks", attended: 22, total: 34, percent: 65 },
  ],
};

export const mockTimetable = [
  { time: "9:00 AM", subject: "Data Structures", room: "Room 204", type: "Lecture" },
  { time: "10:30 AM", subject: "Operating Systems", room: "Room 108", type: "Lecture" },
  { time: "12:00 PM", subject: "DBMS Lab", room: "Lab 3", type: "Lab" },
  { time: "2:00 PM", subject: "Computer Networks", room: "Room 204", type: "Lecture" },
];

export const mockAssignments = [
  {
    id: "1",
    title: "OS Scheduling Algorithms Report",
    subject: "Operating Systems",
    dueDate: "Tomorrow",
    status: "pending" as const,
  },
  {
    id: "2",
    title: "ER Diagram Submission",
    subject: "DBMS",
    dueDate: "In 3 days",
    status: "pending" as const,
  },
  {
    id: "3",
    title: "Linked List Implementation",
    subject: "Data Structures",
    dueDate: "Submitted",
    status: "done" as const,
  },
];

export const mockNotes = [
  { id: "1", title: "Binary Trees & Traversals", subject: "Data Structures", updatedAt: "2h ago" },
  { id: "2", title: "Process Synchronization", subject: "Operating Systems", updatedAt: "Yesterday" },
  { id: "3", title: "Normalization (1NF–BCNF)", subject: "DBMS", updatedAt: "2 days ago" },
];

export const mockActivity = [
  { id: "1", text: "Marked present for Data Structures", time: "9:05 AM" },
  { id: "2", text: "Uploaded notes: Process Synchronization", time: "Yesterday" },
  { id: "3", text: "Submitted Linked List Implementation", time: "2 days ago" },
  { id: "4", text: "Joined Computer Networks study group", time: "3 days ago" },
];

export const mockAnnouncements = [
  {
    id: "1",
    title: "Mid-semester exams schedule released",
    source: "Academic Office",
    time: "1h ago",
  },
  {
    id: "2",
    title: "Placement drive: TCS on-campus, register by Friday",
    source: "Placement Cell",
    time: "5h ago",
  },
  {
    id: "3",
    title: "Library extended hours during exam week",
    source: "Library",
    time: "1 day ago",
  },
];

export const mockNotifications = [
  { id: "1", text: "Your OS assignment is due tomorrow", unread: true },
  { id: "2", text: "Attendance below 75% in Computer Networks", unread: true },
  { id: "3", text: "New note shared in Data Structures", unread: false },
];

export const mockWeeklyProgress = [
  { day: "Mon", attendance: 80, tasks: 2 },
  { day: "Tue", attendance: 75, tasks: 1 },
  { day: "Wed", attendance: 90, tasks: 3 },
  { day: "Thu", attendance: 70, tasks: 1 },
  { day: "Fri", attendance: 85, tasks: 2 },
  { day: "Sat", attendance: 100, tasks: 0 },
  { day: "Sun", attendance: 0, tasks: 0 },
];

export const mockCalendarEvents = [
  { date: 12, label: "OS Assignment due" },
  { date: 15, label: "Mid-sem exams begin" },
  { date: 20, label: "TCS placement drive" },
];
