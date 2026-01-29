import KoreanLunarCalendar from 'korean-lunar-calendar';

/**
 * Converts a Lunar date to a Solar date.
 * @param {number} year - Lunar Year
 * @param {number} month - Lunar Month
 * @param {number} day - Lunar Day
 * @param {boolean} isIntercalation - Whether it is a leap month (default: false)
 * @returns {Date} Javascript Date object (Solar)
 */
export const convertLunarToSolar = (year, month, day, isIntercalation = false) => {
    const calendar = new KoreanLunarCalendar();
    calendar.setLunarDate(year, month, day, isIntercalation);
    return new Date(calendar.solarCalendar.year, calendar.solarCalendar.month - 1, calendar.solarCalendar.day);
};

/**
 * Processes events to handle Lunar dates and recurrence.
 * For Lunar events, it calculates the Solar date for the current/target years.
 * For Solar recurring events, it generates instances for the current/target years.
 * @param {Array} events - List of event objects from Firestore
 * @param {number} targetYear - The year to generate recurring events for (default: current year)
 * @returns {Array} Processed list of events including calculated Solar dates for Lunar events
 */
export const processCalendarEvents = (events, targetYear = new Date().getFullYear()) => {
    const calendar = new KoreanLunarCalendar();
    const processedEvents = [];
    const yearsToProcess = [targetYear - 1, targetYear, targetYear + 1]; // Handle edge cases

    events.forEach(event => {
        const eventDate = new Date(event.start);
        const originalMonth = eventDate.getMonth(); // 0-indexed
        const originalDay = eventDate.getDate();

        // Check if it's a recurring event (YEARLY)
        const isYearly = event.repeat && event.repeat.type === 'YEARLY';

        if (event.isLunar) {
            // --- Lunar Event Handling ---
            const lunarMonth = originalMonth + 1; // 0-indexed to 1-indexed
            const lunarDay = originalDay;
            const isIntercalation = event.isIntercalation || false;

            if (isYearly) {
                // Yearly Repeating Lunar Event
                yearsToProcess.forEach(year => {
                    try {
                        calendar.setLunarDate(year, lunarMonth, lunarDay, isIntercalation);
                        const solarDate = new Date(calendar.solarCalendar.year, calendar.solarCalendar.month - 1, calendar.solarCalendar.day);

                        // Copy hours from original start time if needed, but usually birthdays are all day
                        // For now, we strictly follow the date conversion
                        const startDate = new Date(solarDate);
                        startDate.setHours(eventDate.getHours(), eventDate.getMinutes(), 0, 0);

                        const endDate = new Date(solarDate);
                        // If original was same day, keep same day. If multi-day, getting tricky with lunar.
                        // Assuming single day events for Lunar recurrence usually.
                        endDate.setHours(new Date(event.end).getHours(), new Date(event.end).getMinutes(), 0, 0);

                        processedEvents.push({
                            ...event,
                            id: `${event.id}_${year}_lunar`,
                            originalId: event.id,
                            start: startDate,
                            end: endDate,
                            allDay: event.allDay !== undefined ? event.allDay : true,
                            isLunarInstance: true,
                            lunarDateLabel: `${lunarMonth}.${lunarDay}`
                        });
                    } catch (e) {
                        console.error(`Error converting Lunar date for event ${event.title}:`, e);
                    }
                });
            } else {
                // Single Lunar Event (Non-recurring)
                const lunarYear = eventDate.getFullYear();
                try {
                    calendar.setLunarDate(lunarYear, lunarMonth, lunarDay, isIntercalation);
                    const solarDate = new Date(calendar.solarCalendar.year, calendar.solarCalendar.month - 1, calendar.solarCalendar.day);

                    const startDate = new Date(solarDate);
                    startDate.setHours(eventDate.getHours(), eventDate.getMinutes(), 0, 0);

                    const endDate = new Date(solarDate);
                    endDate.setHours(new Date(event.end).getHours(), new Date(event.end).getMinutes(), 0, 0);

                    processedEvents.push({
                        ...event,
                        start: startDate,
                        end: endDate,
                        lunarDateLabel: `${lunarMonth}.${lunarDay}`
                    });
                } catch (e) {
                    console.error(`Error converting single Lunar date for event ${event.title}:`, e);
                }
            }
        } else if (isYearly) {
            // --- Solar Recurring Event Handling ---
            yearsToProcess.forEach(year => {
                const solarDate = new Date(year, originalMonth, originalDay);

                const startDate = new Date(solarDate);
                startDate.setHours(eventDate.getHours(), eventDate.getMinutes(), 0, 0);

                const endDate = new Date(solarDate);
                endDate.setHours(new Date(event.end).getHours(), new Date(event.end).getMinutes(), 0, 0);

                processedEvents.push({
                    ...event,
                    id: `${event.id}_${year}_solar`,
                    originalId: event.id,
                    start: startDate,
                    end: endDate,
                    isRecurringInstance: true
                });
            });
        } else {
            // --- Regular Single Solar Event ---
            processedEvents.push(event);
        }
    });

    return processedEvents;
};
