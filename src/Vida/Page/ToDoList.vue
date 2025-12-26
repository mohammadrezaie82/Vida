<template>
  <div class="relative min-h-screen overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950">
    <div class="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-30 -z-10 bg-[radial-gradient(closest-side,#22d3ee,transparent)]"></div>
    <div class="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-25 -z-10 bg-[radial-gradient(closest-side,#60a5fa,transparent)]"></div>

    <div class="w-full sm:max-w-2xl mx-auto rounded-3xl p-4 sm:p-6 mt-6 shadow-2xl backdrop-blur-2xl bg-white/50 dark:bg-white/10 border border-white/20 dark:border-white/10 text-slate-900 dark:text-white">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 text-cyan-700 dark:text-cyan-300">📌 {{ $t("todoManager") }}</h2>

      <div class="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          v-model="newTodo"
          type="text"
          :placeholder="$t('newTask')"
          class="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white/30 dark:bg-white/15 text-slate-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400"
        />
        <button @click="saveTodo" class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg hover:shadow-xl transition">
          {{ editingTodo ? $t("save") : $t("add") }}
        </button>
      </div>

      <h3 class="text-base sm:text-lg font-semibold mb-2 text-slate-700 dark:text-slate-200">
        {{ $t("tasksFor") }}: {{ selectedDate.toISOString().slice(0, 10) }}
      </h3>

      <ul :class="[todosForDate.length === 0 ? ' h-10 ' : 'space-y-2 mb-6 h-44 overflow-auto']">
        <li
          v-for="todo in todosForDate"
          :key="todo.id"
          class="flex flex-col  sm:flex-row justify-between items-start sm:items-center p-3 rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 transition"
        >
          <div class="flex items-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto">
            <input type="checkbox" v-model="todo.done" class="w-5 h-5 accent-blue-500 dark:accent-cyan-400" />
            <span
              class="w-full break-words"
              :class="{
                'line-through text-gray-400': todo.done,
                'text-slate-900 dark:text-white': !todo.done,
              }"
            >
              {{ todo.title }}
            </span>
          </div>
          <div class="flex gap-3">
            <button @click="editTodo(todo)" class="text-cyan-500 dark:text-cyan-300 hover:text-cyan-400">✎</button>
            <button @click="deleteTodo(todo.id)" class="text-red-500 hover:text-red-600">✕</button>
          </div>
        </li>
      </ul>

      <div class="w-full bg-white/10 border border-white/10 rounded-3xl shadow-inner p-2 max-h-[80vh] overflow-auto">
        <FullCalendar ref="calendarRef" :options="calendarOptions" class="w-full min-h-[500px]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useI18n } from "vue-i18n";
import { useTodoStore} from "../../stores/todoStore";
import type {Todo} from "../../stores/todoStore";
import { nextTick } from "vue";

const { t } = useI18n();
const todoStore = useTodoStore();

const newTodo = ref("");
const selectedDate = ref(new Date());
const editingTodo = ref<Todo | null>(null);
const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);

const maxTitleLength = 15;

const todosForDate = computed(() =>
  todoStore.todos.filter((t) => t.date === selectedDate.value.toISOString().slice(0, 10))
);

function saveTodo() {
  if (!newTodo.value.trim()) return;

  if (editingTodo.value) {
    todoStore.updateTodo(editingTodo.value.id, { title: newTodo.value });
    editingTodo.value = null;
  } else {
    todoStore.addTodo({
      id: Date.now(),
      title: newTodo.value,
      date: selectedDate.value.toISOString().slice(0, 10),
      done: false,
    });
  }

  newTodo.value = "";
}

function editTodo(todo: Todo) {
  editingTodo.value = todo;
  newTodo.value = todo.title;
}

function deleteTodo(id: number) {
  todoStore.deleteTodo(id);
}

const calendarOptions = {
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  height: "100%",
  events: computed(() =>
    todoStore.todos.map((t) => ({
      id: t.id.toString(),
      title: t.title.length > maxTitleLength ? t.title.slice(0, maxTitleLength) + "…" : t.title,
      start: t.date,
      color: t.done ? "green" : "#32A6D5",
    }))
  ),
  dateClick: (info: { dateStr: string }) => {
    selectedDate.value = new Date(info.dateStr);
  },
};

const updateCalendarEvents = () => {
  const calendarApi = calendarRef.value?.getApi();
  if (!calendarApi) return;

  calendarApi.removeAllEvents();

  todoStore.todos.forEach((t) => {
    calendarApi.addEvent({
      id: t.id.toString(),
      title: t.title.length > maxTitleLength ? t.title.slice(0, maxTitleLength) + "…" : t.title,
      start: t.date,
      color: t.done ? "green" : "#32A6D5",
    });
  });
};

watch(
  () => todoStore.todos,
  () => {
    nextTick(() => {
      updateCalendarEvents();
    });
  },
  { deep: true }
);

todoStore.init();
nextTick(() => updateCalendarEvents());

</script>
