import { defineStore } from "pinia";
import { ref, watch } from "vue";

export interface Todo {
  id: number;
  title: string;
  date: string;
  done: boolean;
}

export const useTodoStore = defineStore("todo", () => {
  const todos = ref<Todo[]>([]);

  const init = () => {
    const saved = localStorage.getItem("todos");
    if (saved) todos.value = JSON.parse(saved);
  };

  watch(
    todos,
    (val) => {
      localStorage.setItem("todos", JSON.stringify(val));
    },
    { deep: true }
  );

  const addTodo = (todo: Todo) => {
    todos.value.push(todo);
  };

  const deleteTodo = (id: number) => {
    todos.value = todos.value.filter((t) => t.id !== id);
  };

  const updateTodo = (id: number, payload: Partial<Todo>) => {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) Object.assign(todo, payload);
  };

  return { todos, addTodo, deleteTodo, updateTodo, init };
});
