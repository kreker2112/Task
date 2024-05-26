import { defineStore } from "pinia";
import dayjs from "dayjs";

export const useCalendarStore = defineStore("calendar", {
  state: () => ({
    events: [] as Array<{ id: string; title: string; date: dayjs.Dayjs }>,
  }),
  actions: {
    getEventsByDate(date: dayjs.Dayjs) {
      return this.events.filter((event) => event.date.isSame(date, "day"));
    },
    addEvent(event: { id: string; title: string; date: dayjs.Dayjs }) {
      this.events.push(event);
    },
    updateEvent(updatedEvent: {
      id: string;
      title: string;
      date: dayjs.Dayjs;
    }) {
      const index = this.events.findIndex(
        (event) => event.id === updatedEvent.id
      );
      if (index !== -1) {
        this.events[index] = updatedEvent;
      }
    },
    deleteEvent(eventId: string) {
      this.events = this.events.filter((event) => event.id !== eventId);
    },
  },
});
