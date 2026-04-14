import { format, parseISO, isValid, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, formatStr);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'PPpp');
};

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
};

export const isSchoolDay = (date: Date): boolean => {
  // Skip weekends (Saturday and Sunday)
  return !isWeekend(date);
};

export const getAttendanceColor = (status: string): string => {
  switch (status) {
    case 'present':
      return 'text-green-600 bg-green-100';
    case 'absent':
      return 'text-red-600 bg-red-100';
    case 'late':
      return 'text-yellow-600 bg-yellow-100';
    case 'excused':
      return 'text-blue-600 bg-blue-100';
    case 'sick':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusBadge = (status: string): { label: string; color: string } => {
  const statusMap: Record<string, { label: string; color: string }> = {
    present: { label: 'Present', color: 'bg-green-100 text-green-800' },
    absent: { label: 'Absent', color: 'bg-red-100 text-red-800' },
    late: { label: 'Late', color: 'bg-yellow-100 text-yellow-800' },
    excused: { label: 'Excused', color: 'bg-blue-100 text-blue-800' },
    sick: { label: 'Sick', color: 'bg-purple-100 text-purple-800' },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
};