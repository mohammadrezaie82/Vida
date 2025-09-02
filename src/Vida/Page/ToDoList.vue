<template>
    <div class="relative min-h-screen overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950">
        <div class="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-30 -z-10 bg-[radial-gradient(closest-side,#22d3ee,transparent)]"></div>
        <div class="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-25 -z-10 bg-[radial-gradient(closest-side,#60a5fa,transparent)]"></div>

        <div
            class="w-full sm:max-w-2xl mx-auto rounded-3xl p-4 sm:p-6 mt-6 shadow-2xl backdrop-blur-2xl bg-white/50 dark:bg-white/10 border border-white/20 dark:border-white/10 text-slate-900 dark:text-white"
        >
            <h2 class="text-xl sm:text-2xl font-bold mb-4 text-cyan-700 dark:text-cyan-300">📌 {{ $t("todoManager") }}</h2>

            <div class="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                    v-model="newTodo"
                    type="text"
                    :placeholder="$t('newTask')"
                    class="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white/30 dark:bg-white/15 text-slate-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400"
                />
                <button @click="addTodo" class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg hover:shadow-xl transition">
                    {{ $t("add") }}
                </button>
            </div>

            <h3 class="text-base sm:text-lg font-semibold mb-2 text-slate-700 dark:text-slate-200">{{ $t("tasksFor") }}: {{ selectedDate.toISOString().slice(0, 10) }}</h3>

            <ul class="space-y-2 mb-6">
                <li
                    v-for="todo in todosForDate"
                    :key="todo.id"
                    class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 transition"
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
<script setup>
import { ref, computed, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const todos = ref([]);
const newTodo = ref("");
const selectedDate = ref(new Date());
const emit = defineEmits(["dataTodos"]);

watch(todos, (newTodo) => {
    emit("dataTodos", todos);
});
function addTodo() {
    if (!newTodo.value.trim()) return;
    todos.value.push({
        id: Date.now(),
        title: newTodo.value,
        date: selectedDate.value.toISOString().slice(0, 10),
        done: false,
    });
    newTodo.value = "";
}

function deleteTodo(id) {
    todos.value = todos.value.filter((t) => t.id !== id);
}

function editTodo(todo) {
    const newText = prompt("ویرایش تسک:", todo.title);
    if (newText) todo.title = newText;
}

const todosForDate = computed(() => todos.value.filter((t) => t.date === selectedDate.value.toISOString().slice(0, 10)));

const calendarRef = ref(null);

const maxTitleLength = 15;

const calendarOptions = ref({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    height: "100%", 
    events: computed(() =>
        todos.value.map((t) => ({
            id: t.id,
            title: t.title.length > 15 ? t.title.slice(0, 15) + "…" : t.title,
            date: t.date,
            color: t.done ? "green" : "#32A6D5",
        }))
    ),
    dateClick: (info) => {
        selectedDate.value = new Date(info.dateStr);
    },
});
</script>
