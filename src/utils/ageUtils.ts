export interface AgeResults {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  nextBirthday: string;
  daysUntilBirthday: number;
}

export function calculateAge(birthDate: string): AgeResults {
  if (!birthDate) {
    return {
      years: 0, months: 0, days: 0, totalDays: 0, totalWeeks: 0, totalMonths: 0, nextBirthday: '', daysUntilBirthday: 0
    };
  }
  const birth = new Date(birthDate);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return {
    years, months, days, totalDays, totalWeeks, totalMonths,
    nextBirthday: nextBirthday.toLocaleDateString(), daysUntilBirthday
  };
}

export function getMonthDay(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const famousBirthdays: Record<string, string[]> = {
  '01-15': ['Martin Luther King Jr.'],
  '02-12': ['Abraham Lincoln', 'Charles Darwin'],
  '03-14': ['Albert Einstein'],
  '07-18': ['Nelson Mandela'],
  '10-02': ['Mahatma Gandhi'],
  '12-25': ['Isaac Newton', 'Humphrey Bogart'],
};

export function getFamousPeople(monthDay: string): string[] {
  return famousBirthdays[monthDay] || [];
} 