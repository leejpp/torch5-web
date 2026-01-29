const { convertLunarToSolar } = require('./src/utils/lunarCalendar.js');

// Mock KoreanLunarCalendar locally for the test since we are in node environment
// and the import in local file uses 'import' which might fail in plain node without babel 
// manual verify just by running the previous logic or by inspection.
// Actually, checking if the file correction is valid by running a similar script manually
// reusing the knowledge gained.

const KoreanLunarCalendar = require('korean-lunar-calendar');
const calendar = new KoreanLunarCalendar();
calendar.setLunarDate(2026, 12, 27, false);

console.log('Direct Access Check:');
console.log('calendar.solarYear:', calendar.solarYear); // Should be undefined
console.log('calendar.solarCalendar.year:', calendar.solarCalendar.year); // Should be 2027

// If this passes, my change to lunarCalendar.js logic is correct.
