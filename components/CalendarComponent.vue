<template>
  <div class="calendar">
    <div class="view-buttons">
      <button class="view-button" @click="() => setView('day')">Day</button>
      <button class="view-button" @click="() => setView('week')">Week</button>
      <button class="view-button" @click="() => setView('month')">Month</button>
    </div>
    <button class="create-button" @click="showEventForm()">Create Event</button>
    <header class="header-nav">
      <button class="nav-button" @click="prevPeriod">Prev</button>
      <h2>{{ currentPeriod }}</h2>
      <button class="nav-button" @click="nextPeriod">Next</button>
    </header>
    <div :class="['calendar-view', currentView]">
      <div
        v-for="(day, index) in days"
        :key="index"
        :class="['day', currentView]"
        @click="currentView === 'month' ? selectDay(day.date) : null"
        @dragover.prevent="onDragOver"
        @drop="(e) => onDrop(day.date, e)"
      >
        <div class="date">
          {{ day.date.format(currentView === "month" ? "D" : "MMM D") }}
        </div>
        <div v-if="currentView !== 'month'" class="hours">
          <div
            v-for="hour in 24"
            :key="hour"
            class="hour"
            @click="selectTimeSlot(day.date, hour - 1)"
            @dragover.prevent
            @drop="(e) => onDropTimeSlot(day.date, hour - 1, e)"
          >
            <div class="hour-label">{{ hour - 1 }}:00</div>
            <div class="hour-line"></div>
          </div>
          <div
            v-for="event in day.events"
            :key="event.id"
            class="event"
            :style="getEventStyle(event)"
            @click.stop="editEvent(event)"
            @dragstart="(e) => onDragStart(event, e)"
            draggable="true"
          >
            <span class="event-time">{{ event.date.format("HH:mm") }}</span>
            {{ event.title }}
            <button @click.stop="deleteEvent(event.id)" class="delete-button">
              ×
            </button>
          </div>
        </div>
        <div v-else class="events">
          <div
            v-for="(event, eventIndex) in day.events.sort((a, b) =>
              a.date.diff(b.date)
            )"
            :key="event.id"
            class="event"
            :style="getMonthEventStyle(eventIndex, day.events.length)"
            @click.stop="editEvent(event)"
            @dragstart="(e) => onDragStart(event, e)"
            draggable="true"
          >
            <span class="event-time">{{ event.date.format("HH:mm") }}</span>
            {{ event.title }}
            <button @click.stop="deleteEvent(event.id)" class="delete-button">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isFormVisible" class="event-form">
      <h3>{{ isEditing ? "Edit Event" : "Create Event" }}</h3>
      <form @submit.prevent="saveEvent">
        <input
          type="text"
          v-model="eventForm.title"
          placeholder="Event Title"
          required
        />
        <input type="datetime-local" v-model="eventForm.date" required />
        <button type="submit">Save</button>
        <button type="button" @click="closeForm">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCalendarStore } from "~/store/calendarStore";
import dayjs from "dayjs";

interface Event {
  id: string;
  title: string;
  date: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
}

const calendarStore = useCalendarStore();
const router = useRouter();

const currentDate = ref(dayjs());
const currentView = ref<"day" | "week" | "month">("month");
const isFormVisible = ref(false);
const isEditing = ref(false);
const eventForm = ref<{
  id: string;
  title: string;
  date: string;
  endDate: string;
}>({
  id: "",
  title: "",
  date: "",
  endDate: "",
});
const selectedEvent = ref<Event | null>(null);
const selectedDay = ref<dayjs.Dayjs | null>(null);
const selectedHour = ref<number | null>(null);

const days = computed(() => {
  const daysArray: Array<{ date: dayjs.Dayjs; events: Event[] }> = [];
  if (currentView.value === "month") {
    const startOfMonth = currentDate.value.startOf("month");
    const endOfMonth = currentDate.value.endOf("month");
    const daysInMonth = endOfMonth.date();
    for (let i = 0; i < daysInMonth; i += 1) {
      const day = startOfMonth.add(i, "day");
      daysArray.push({
        date: day,
        events: calendarStore.getEventsByDate(day),
      });
    }
  } else if (currentView.value === "week") {
    const startOfWeek = currentDate.value.startOf("week");
    for (let i = 0; i < 7; i += 1) {
      const day = startOfWeek.add(i, "day");
      daysArray.push({
        date: day,
        events: calendarStore.getEventsByDate(day),
      });
    }
  } else if (currentView.value === "day") {
    const day = currentDate.value;
    daysArray.push({
      date: day,
      events: calendarStore.getEventsByDate(day),
    });
  }
  return daysArray;
});

const prevPeriod = () => {
  if (currentView.value === "month") {
    currentDate.value = currentDate.value.subtract(1, "month");
  } else if (currentView.value === "week") {
    currentDate.value = currentDate.value.subtract(1, "week");
  } else if (currentView.value === "day") {
    currentDate.value = currentDate.value.subtract(1, "day");
  }
};

const nextPeriod = () => {
  if (currentView.value === "month") {
    currentDate.value = currentDate.value.add(1, "month");
  } else if (currentView.value === "week") {
    currentDate.value = currentDate.value.add(1, "week");
  } else if (currentView.value === "day") {
    currentDate.value = currentDate.value.add(1, "day");
  }
};

const setView = (view: "day" | "week" | "month") => {
  currentView.value = view;
};

const selectDay = (day: dayjs.Dayjs) => {
  selectedDay.value = day;
  selectedHour.value = null;
  showEventForm();
};

const selectTimeSlot = (day: dayjs.Dayjs, hour: number) => {
  selectedDay.value = day;
  selectedHour.value = hour;
  showEventForm();
};

const showEventForm = (event: Event | null = null) => {
  if (event) {
    isEditing.value = true;
    eventForm.value = {
      ...event,
      date: dayjs(event.date).format("YYYY-MM-DDTHH:mm"),
      endDate: event.endDate
        ? dayjs(event.endDate).format("YYYY-MM-DDTHH:mm")
        : "",
    };
    selectedEvent.value = event;
  } else {
    isEditing.value = false;
    eventForm.value = { id: "", title: "", date: "", endDate: "" };
    if (selectedDay.value) {
      if (selectedHour.value !== null) {
        eventForm.value.date = selectedDay.value
          .hour(selectedHour.value)
          .minute(0)
          .format("YYYY-MM-DDTHH:mm");
      } else {
        eventForm.value.date = selectedDay.value.format("YYYY-MM-DDTHH:mm");
      }
    }
  }
  isFormVisible.value = true;
};

const saveEvent = () => {
  const event: Event = {
    ...eventForm.value,
    date: dayjs(eventForm.value.date),
    endDate: dayjs(eventForm.value.date).add(1, "hour"),
  };
  if (isEditing.value) {
    calendarStore.updateEvent(event);
  } else {
    event.id = `${Date.now()}`;
    calendarStore.addEvent(event);
  }
  closeForm();
};

const closeForm = () => {
  isFormVisible.value = false;
  eventForm.value = { id: "", title: "", date: "", endDate: "" };
  selectedEvent.value = null;
  selectedDay.value = null;
  selectedHour.value = null;
};

const editEvent = (event: Event) => {
  showEventForm(event);
};

const deleteEvent = (eventId: string) => {
  calendarStore.deleteEvent(eventId);
};

const onDragStart = (event: Event, e: DragEvent) => {
  selectedEvent.value = event;
  e.dataTransfer?.setData("text/plain", `${event.date.hour()}`);
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const onDrop = (day: dayjs.Dayjs, e: DragEvent) => {
  e.preventDefault();
  if (selectedEvent.value) {
    const hour = parseInt(e.dataTransfer?.getData("text/plain") || "0", 10);
    const newEvent = { ...selectedEvent.value, date: day.hour(hour).minute(0) };
    calendarStore.updateEvent(newEvent);
    selectedEvent.value = null;
  }
};

const onDropTimeSlot = (day: dayjs.Dayjs, hour: number, e: DragEvent) => {
  e.preventDefault();
  if (selectedEvent.value) {
    const newEvent = { ...selectedEvent.value, date: day.hour(hour).minute(0) };
    calendarStore.updateEvent(newEvent);
    selectedEvent.value = null;
  }
};

const getEventStyle = (event: Event) => {
  const start = event.date.hour() * 60 + event.date.minute();
  return {
    top: `${(start / 60) * 4}rem`,
    height: "4rem",
  };
};

const getMonthEventStyle = (eventIndex: number, totalEvents: number) => {
  const maxHeight = 20;
  const eventHeight = totalEvents <= 5 ? maxHeight : maxHeight / totalEvents;
  return {
    top: `${eventIndex * eventHeight}%`,
    height: `${eventHeight}%`,
  };
};

const currentPeriod = computed(() => {
  if (currentView.value === "month") {
    return currentDate.value.format("MMMM YYYY");
  } else if (currentView.value === "week") {
    const startOfWeek = currentDate.value.startOf("week").format("MMM D");
    const endOfWeek = currentDate.value.endOf("week").format("MMM D");
    return `${startOfWeek} - ${endOfWeek}`;
  } else if (currentView.value === "day") {
    return currentDate.value.format("MMMM D, YYYY");
  }
  return "";
});

const goToHome = () => {
  router.push("/");
};
</script>

<style scoped>
.calendar {
  width: 100%;
  height: auto;
}

.calendar header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.calendar header h2 {
  font-size: 3em;
}

.view-buttons {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.view-buttons button,
.nav-button,
.create-button {
  margin: 0 5px 5px 0;
  padding: 1em 1.5em;
  font-size: 1rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  background-color: oklch(59.02% 0.146 172.62);
  color: white;
  transition: background-color 0.3s ease;
}

.view-buttons button:hover,
.nav-button:hover,
.create-button:hover {
  background-color: oklch(0.51 0.13 172.8);
}

.calendar-view.day {
  display: flex;
  flex-direction: column;
  border: 2px solid #000;
  height: calc(100vh - 200px);
}

.calendar-view.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-view.month {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, 1fr);
  height: calc(100vh - 200px);
}

.day.day {
  border: none;
  padding: 0;
  flex: 1;
  position: relative;
}

.day.week {
  border: 1px solid #ddd;
  position: relative;
}

.day.month {
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
}

.date {
  font-weight: bold;
  text-align: center;
}

.hours {
  position: relative;
  height: 96rem;
}

.hour {
  position: relative;
  height: 4rem;
  cursor: pointer;
}

.hour-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  border-top: 1px solid #ddd;
}

.hour-label {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 0.75rem;
  z-index: 999;
}

.events {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.event {
  position: absolute;
  left: 0;
  right: 0;
  background-color: oklch(59.02% 0.146 172.62);
  color: white;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 4rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.event-time {
  margin-right: 10px;
}

.event button {
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 2rem;
  margin-left: auto;
  padding: 0 5px;
}

.event-form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border: 1px solid #ddd;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.event-form h3 {
  margin-top: 0;
}

.event-form form {
  display: flex;
  flex-direction: column;
}

.event-form input,
.event-form button {
  margin-bottom: 10px;
}

.event-form button {
  cursor: pointer;
}
</style>
