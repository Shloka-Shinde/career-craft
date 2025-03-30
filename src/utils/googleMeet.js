/**
 * Utility functions for generating Google Meet links
 */
// For utilities
// For UI components
import { PopoverTrigger } from "@/components/ui/popover";
// Generate a random string for the meeting ID
/**
 * Utility functions for generating Google Meet links
 */

// Generate a random string for the meeting ID
const generateRandomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Format date for Google Calendar
const formatDate = (date) => {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
};

// Generate a Google Meet link
const generateMeetLink = () => {
  const meetId = [
      generateRandomString(3),
      generateRandomString(4),
      generateRandomString(3)
  ].join('-');
  
  return `https://meet.google.com/${meetId}`;
};

// Generate a Google Calendar event link
const generateCalendarLink = (
  meetLink,
  title,
  startTime,
  endTime,
  description = '',
  attendeeEmails = []
) => {
  const startTimeStr = formatDate(startTime);
  const endTimeStr = formatDate(endTime);
  
  const fullDescription = `${description}\n\nJoin with Google Meet: ${meetLink}`;
  
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: encodeURIComponent(title),
      dates: `${startTimeStr}/${endTimeStr}`,
      details: encodeURIComponent(fullDescription),
      add: attendeeEmails.join(','),
      ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export { generateMeetLink, generateCalendarLink };