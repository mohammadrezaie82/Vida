import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../Vida/Login/LoginVida.vue";
import DashboardPage from "../Vida/Layout.vue";
import Dashboard from "../Vida/Page/Dashboard.vue";
import ToDoList from "../Vida/Page/ToDoList.vue";
import Weather from "../Vida/Page/Weather.vue";
import Profile from "../Vida/Page/Profile.vue";

const routes = [
    {
        path: "/",
        name: "Login",
        component: LoginPage,
    },
    {
        path: "/dashboard",
        component: DashboardPage,
        children: [
            {
                path: "",
                name: "DashboardDefault",
                redirect: { name: "DashboardHome" }
            },
            {
                path: "dashboard-home",
                name: "DashboardHome",
                component: Dashboard,
            },
            {
                path: "todo-list",
                name: "ToDoList",
                component: ToDoList,
            },
            {
                path: "weather",
                name: "Weather",
                component: Weather,
            },
            {
                path: "profile",
                name: "Profile",
                component: Profile,
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Debug logging (در production حذف کنید)
router.beforeEach((to, from, next) => {
    console.log('Navigating to:', to.fullPath, 'Name:', to.name);
    next();
});

export default router;