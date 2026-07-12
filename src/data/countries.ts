export interface CountryInfo { name: string; flag: string; currency: string; drivingNote: string; }
export const countries: Record<string, CountryInfo> = {
  Romania: { name: 'Romania', flag: '🇷🇴', currency: 'RON', drivingNote: 'Fuel and groceries: Orșova on Day 1.' },
  Serbia: { name: 'Serbia', flag: '🇷🇸', currency: 'RSD', drivingNote: 'Keep cash for smaller stops and camps.' },
  'Bosnia and Herzegovina': { name: 'Bosnia & Herzegovina', flag: '🇧🇦', currency: 'BAM', drivingNote: 'Stay on paved roads and marked trails.' },
  Montenegro: { name: 'Montenegro', flag: '🇲🇪', currency: 'EUR', drivingNote: 'Fuel before the border; avoid Kotor peak parking.' },
  Albania: { name: 'Albania', flag: '🇦🇱', currency: 'ALL', drivingNote: 'Confirm road conditions and keep some cash.' },
  Greece: { name: 'Greece', flag: '🇬🇷', currency: 'EUR', drivingNote: 'Fuel in Gjirokastër or after crossing at Ioannina.' },
};
export interface DayCountryContext { origin: string; destination: string; }
export const dayCountries: Record<number, DayCountryContext> = {
  1: { origin: 'Romania', destination: 'Romania' }, 2: { origin: 'Romania', destination: 'Serbia' }, 3: { origin: 'Serbia', destination: 'Serbia' }, 4: { origin: 'Serbia', destination: 'Serbia' }, 5: { origin: 'Serbia', destination: 'Bosnia and Herzegovina' }, 6: { origin: 'Bosnia and Herzegovina', destination: 'Bosnia and Herzegovina' }, 7: { origin: 'Bosnia and Herzegovina', destination: 'Montenegro' }, 8: { origin: 'Montenegro', destination: 'Albania' }, 9: { origin: 'Albania', destination: 'Albania' }, 10: { origin: 'Albania', destination: 'Greece' },
};
export const countryOfDay = (day: number) => dayCountries[day];
