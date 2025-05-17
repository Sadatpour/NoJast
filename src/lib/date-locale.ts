import { Locale } from 'date-fns';

// Persian (Farsi) locale for date-fns
export const fa: Locale = {
  code: 'fa-IR',
  formatDistance: (token, count, options) => {
    let result = '';
    switch (token) {
      case 'xSeconds':
        result = count === 1 ? 'یک ثانیه' : `${count} ثانیه`;
        break;
      case 'xMinutes':
        result = count === 1 ? 'یک دقیقه' : `${count} دقیقه`;
        break;
      case 'xHours':
        result = count === 1 ? 'یک ساعت' : `${count} ساعت`;
        break;
      case 'xDays':
        result = count === 1 ? 'یک روز' : `${count} روز`;
        break;
      case 'xMonths':
        result = count === 1 ? 'یک ماه' : `${count} ماه`;
        break;
      case 'xYears':
        result = count === 1 ? 'یک سال' : `${count} سال`;
        break;
      case 'lessThanXSeconds':
        result = count === 1 ? 'کمتر از یک ثانیه' : `کمتر از ${count} ثانیه`;
        break;
      case 'lessThanXMinutes':
        result = count === 1 ? 'کمتر از یک دقیقه' : `کمتر از ${count} دقیقه`;
        break;
      case 'lessThanXHours':
        result = count === 1 ? 'کمتر از یک ساعت' : `کمتر از ${count} ساعت`;
        break;
      case 'lessThanXDays':
        result = count === 1 ? 'کمتر از یک روز' : `کمتر از ${count} روز`;
        break;
      case 'lessThanXMonths':
        result = count === 1 ? 'کمتر از یک ماه' : `کمتر از ${count} ماه`;
        break;
      case 'lessThanXYears':
        result = count === 1 ? 'کمتر از یک سال' : `کمتر از ${count} سال`;
        break;
      case 'overXYears':
        result = count === 1 ? 'بیش از یک سال' : `بیش از ${count} سال`;
        break;
      case 'almostXYears':
        result = count === 1 ? 'تقریباً یک سال' : `تقریباً ${count} سال`;
        break;
      default:
        result = '';
    }

    return options?.addSuffix
      ? options.comparison && options.comparison > 0
        ? `در ${result}`
        : `${result} پیش`
      : result;
  },
  formatLong: {
    date: () => 'yyyy/MM/dd',
    time: () => 'HH:mm:ss',
    dateTime: () => 'yyyy/MM/dd HH:mm:ss',
  },
  formatRelative: (token) => {
    const translations = {
      yesterday: 'دیروز',
      today: 'امروز',
      tomorrow: 'فردا',
      nextWeek: 'هفته‌ی آینده',
      other: 'yyyy/MM/dd',
    };
    
    return translations[token as keyof typeof translations] || '';
  },
  localize: {
    ordinalNumber: (number) => `${number}م`,
    era: (era) => {
      const eras = {
        0: 'قبل از میلاد',
        1: 'بعد از میلاد',
      };
      return eras[era as 0 | 1] || '';
    },
    quarter: (quarter) => {
      const quarters = {
        1: 'سه‌ماهه اول',
        2: 'سه‌ماهه دوم',
        3: 'سه‌ماهه سوم',
        4: 'سه‌ماهه چهارم',
      };
      return quarters[quarter as 1 | 2 | 3 | 4] || '';
    },
    month: (month) => {
      const months = {
        0: 'فروردین',
        1: 'اردیبهشت',
        2: 'خرداد',
        3: 'تیر',
        4: 'مرداد',
        5: 'شهریور',
        6: 'مهر',
        7: 'آبان',
        8: 'آذر',
        9: 'دی',
        10: 'بهمن',
        11: 'اسفند',
      };
      return months[month as keyof typeof months] || '';
    },
    day: (day) => {
      const days = {
        0: 'یکشنبه',
        1: 'دوشنبه',
        2: 'سه‌شنبه',
        3: 'چهارشنبه',
        4: 'پنج‌شنبه',
        5: 'جمعه',
        6: 'شنبه',
      };
      return days[day as keyof typeof days] || '';
    },
    dayPeriod: (dayPeriod) => {
      const dayPeriods = {
        am: 'قبل از ظهر',
        pm: 'بعد از ظهر',
        midnight: 'نیمه‌شب',
        noon: 'ظهر',
        morning: 'صبح',
        afternoon: 'بعد از ظهر',
        evening: 'عصر',
        night: 'شب',
      };
      return dayPeriods[dayPeriod as keyof typeof dayPeriods] || '';
    },
  },
  match: {
    ordinalNumber: () => ({
      match: /^(\d+)(th|st|nd|rd)?/i,
      parse: (matchResult) => parseInt(matchResult[1], 10),
    }),
    era: () => ({
      match: /^(before christ|before common era|anno domini|common era)/i,
      parse: (matchResult) => (matchResult[1].toLowerCase().startsWith('b') ? 0 : 1),
    }),
    quarter: () => ({
      match: /^[1-4]/i,
      parse: (matchResult) => parseInt(matchResult[0], 10) as 1 | 2 | 3 | 4,
    }),
    month: () => ({
      match: /^(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)/i,
      parse: (matchResult) => {
        const valueMap: Record<string, number> = {
          'فروردین': 0,
          'اردیبهشت': 1,
          'خرداد': 2,
          'تیر': 3,
          'مرداد': 4,
          'شهریور': 5,
          'مهر': 6,
          'آبان': 7,
          'آذر': 8,
          'دی': 9,
          'بهمن': 10,
          'اسفند': 11,
        };
        return valueMap[matchResult[0].toLowerCase()];
      },
    }),
    day: () => ({
      match: /^(یکشنبه|دوشنبه|سه‌شنبه|چهارشنبه|پنج‌شنبه|جمعه|شنبه)/i,
      parse: (matchResult) => {
        const valueMap: Record<string, number> = {
          'یکشنبه': 0,
          'دوشنبه': 1,
          'سه‌شنبه': 2,
          'چهارشنبه': 3,
          'پنج‌شنبه': 4,
          'جمعه': 5,
          'شنبه': 6,
        };
        return valueMap[matchResult[0].toLowerCase()];
      },
    }),
    dayPeriod: () => ({
      match: /^(قبل از ظهر|بعد از ظهر|نیمه‌شب|ظهر|صبح|بعد از ظهر|عصر|شب)/i,
      parse: (matchResult) => {
        const valueMap: Record<string, string> = {
          'قبل از ظهر': 'am',
          'بعد از ظهر': 'pm',
          'نیمه‌شب': 'midnight',
          'ظهر': 'noon',
          'صبح': 'morning',
          'بعد از ظهر': 'afternoon',
          'عصر': 'evening',
          'شب': 'night',
        };
        return valueMap[matchResult[0].toLowerCase()];
      },
    }),
  },
  options: {
    weekStartsOn: 6 as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    firstWeekContainsDate: 1,
  },
};

export default fa; 