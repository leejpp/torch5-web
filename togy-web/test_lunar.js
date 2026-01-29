const KoreanLunarCalendar = require('korean-lunar-calendar');
const calendar = new KoreanLunarCalendar();

calendar.setLunarDate(2026, 12, 27, false);

console.log('Instance keys:', Object.keys(calendar));
console.log('solarYear:', calendar.solarYear);
console.log('solarMonth:', calendar.solarMonth);
console.log('solarDay:', calendar.solarDay);

// Check if there are get methods
console.log('getSolarYear exists:', typeof calendar.getSolarYear === 'function');
console.log('getSolarMonth exists:', typeof calendar.getSolarMonth === 'function');
console.log('getSolarDay exists:', typeof calendar.getSolarDay === 'function');

console.log('Full object:', JSON.stringify(calendar, null, 2));
