<template>
  <div class="calendar">
    <header>
      <button @click="prevPeriod">Prev</button>
      <h2>{{ currentPeriod }}</h2>
      <button @click="nextPeriod">Next</button>
    </header>
    <div class="view-buttons">
      <button @click="() => setView('day')">Day</button>
      <button @click="() => setView('week')">Week</button>
      <button @click="() => setView('month')">Month</button>
    </div>
    <button @click="showEventForm()">Create Event</button>
    <div :class="['calendar-view', currentView]">
      <div
        v-for="(day, index) in days"
        :key="index"
        :class="['day', currentView]"
        @click="selectDay(day.date)"
        @dragover.prevent="onDragOver"
        @drop="onDrop(day.date)"
      >
        <div class="date">
          {{ day.date.format(currentView === "month" ? "D" : "MMM D") }}
        </div>
        <div v-if="currentView !== 'month'" class="hours">
          <div v-for="hour in 24" :key="hour" class="hour">
            <div class="hour-line"></div>
            <div class="hour-label">{{ hour }}:00</div>
          </div>
          <div
            v-for="event in day.events"
            :key="event.id"
            class="event"
            :style="getEventStyle(event)"
            @click.stop="editEvent(event)"
            @dragstart="onDragStart(event)"
            draggable="true"
          >
            <span class="event-time">{{ event.date.format("HH:mm") }}</span>
            {{ event.title }}
            <button @click.stop="deleteEvent(event.id)">Delete</button>
          </div>
        </div>
        <div v-else class="events">
          <div
            v-for="event in day.events"
            :key="event.id"
            class="event"
            @click.stop="editEvent(event)"
            @dragstart="onDragStart(event)"
            draggable="true"
          >
            <span class="event-time">{{ event.date.format("HH:mm") }}</span>
            {{ event.title }}
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

const days = computed(() => {
  const daysArray: Array<{ date: dayjs.Dayjs; events: Event[] }> = [];
  if (currentView.value === "month") {
    const startOfMonth = currentDate.value.startOf("month");
    const endOfMonth = currentDate.value.endOf("month");
    const daysInMonth = endOfMonth.date();
    for (let i = 0; i < daysInMonth; i++) {
      const day = startOfMonth.add(i, "day");
      daysArray.push({
        date: day,
        events: calendarStore.getEventsByDate(day),
      });
    }
  } else if (currentView.value === "week") {
    const startOfWeek = currentDate.value.startOf("week");
    for (let i = 0; i < 7; i++) {
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
      eventForm.value.date = selectedDay.value.format("YYYY-MM-DDTHH:mm");
    }
  }
  isFormVisible.value = true;
};

const saveEvent = () => {
  const event: Event = {
    ...eventForm.value,
    date: dayjs(eventForm.value.date),
    endDate: eventForm.value.endDate
      ? dayjs(eventForm.value.endDate)
      : undefined,
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
  selectedEvent.value = null; // Reset selectedEvent on form close
  selectedDay.value = null; // Reset selectedDay on form close
};

const editEvent = (event: Event) => {
  showEventForm(event);
};

const deleteEvent = (eventId: string) => {
  calendarStore.deleteEvent(eventId);
};

const onDragStart = (event: Event) => {
  selectedEvent.value = event;
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const onDrop = (day: dayjs.Dayjs) => {
  if (selectedEvent.value) {
    const newEvent = { ...selectedEvent.value, date: day };
    calendarStore.updateEvent(newEvent);
    selectedEvent.value = null;
  }
};

const getEventStyle = (event: Event) => {
  if (!event.date || !event.endDate) {
    return {};
  }
  const start = event.date.hour() * 60 + event.date.minute();
  const end = event.endDate.hour() * 60 + event.endDate.minute();
  const duration = end - start;
  return {
    top: `${(start / 60) * 4}rem`,
    height: `${(duration / 60) * 4}rem`,
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
}

.view-buttons {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.view-buttons button {
  margin: 0 5px;
}

.calendar-view.day {
  display: flex;
  flex-direction: column;
  border: 2px solid #000; /* External border */
  height: calc(100vh - 200px); /* Adjust height based on other elements */
}

.calendar-view.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-view.month {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, 1fr); /* Assuming 5 rows for simplicity */
  height: calc(100vh - 200px); /* Adjust height based on other elements */
}

.day.day {
  border: none; /* Remove internal borders */
  padding: 0;
  flex: 1;
  position: relative; /* For absolute positioning of events */
}

.day.week {
  border: 1px solid #ddd;
  padding: 10px;
}

.day.month {
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Align date to top */
}

.date {
  font-weight: bold;
  text-align: center; /* Center align the date */
}

.hours {
  position: relative;
  height: 96rem; /* 24 hours * 4rem per hour */
}

.hour {
  position: relative;
  height: 4rem;
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
  left: -2.5rem;
  font-size: 0.75rem;
}

.events {
  margin-top: 5px;
  display: flex;
  flex-direction: column; /* Stack events vertically */
  gap: 5px; /* Space between events */
}

.event {
  position: absolute;
  left: 0;
  right: 0;
  background-color: #0074d9;
  color: white;
  padding: 2px;
  margin-top: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.event-time {
  margin-right: 10px;
}

.event button {
  background: red;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: auto;
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
