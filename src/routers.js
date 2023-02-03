import {createRouter, createWebHistory} from 'vue-router'
import Projects from './components/ProjectPage'
import Assets from './components/Assets'

const routes = [
    {
        path:'/',
        name:'home',
        component: Projects
    },
    {
        path:'/project/:id',
        name:'project',
        component: Assets,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;