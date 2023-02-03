<template>
    <div class="page">
        <h1> Courses </h1>
        <draggable id="projects" v-model="projects" item-key="id">
            <template #item="{element}">
                <div class="card-body">
                    <router-link :to="{name:'project', params:{id:element.id}}"><p class="card-title">{{element.name}}</p></router-link>
                    <button class="btn btn-danger" @click="deleteProject(element)">Delete</button>
                </div>
            </template>
        </draggable>
        <form @submit.prevent="insertProject" class="card-body-create">
            <input
                type="text"
                class="form-control card-title"
                placeholder="Course Number"
                v-model="course_id"
                />
            <br/>
            <button class="btn btn-success">Add</button>
        </form>
    </div>
</template>

<script>
import draggable from 'vuedraggable'
export default {
    components: {
        draggable
    },
    data() {
        return {
            projects: [],
            course_id: null
        }
    },
    methods: {
        deleteProject(project){
            fetch(`http://34.125.83.68/api/projects/${project.id}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(() => {
                const projectIndex = this.projects.findIndex(p => p.id === project.id)
                this.projects.splice(projectIndex, 1)
                localStorage.removeItem(project.id+'groups')
                localStorage.removeItem(project.id+'projectname')
                localStorage.removeItem(project.id+'comments')
            })
            .catch(error => {
                console.log(error)
            })
        },
        insertProject(){
            if (this.course_id) {
                fetch('http://34.125.83.68/api/create_project/', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({course_id: this.course_id})
                })
                .then(resp => resp.json())
                .then(data => {
                    this.projects.push(data.data)
                })
                .catch(error => {
                    console.log(error)
                })
            }
        },
    },
    watch: {
        projects: {
            handler() {
                if (this.projects){
                    localStorage.setItem('projects', JSON.stringify(this.projects));
                } else {
                    localStorage.setItem('projects', 'null')
                }
            },
            deep: true
        }
    },
    created() {
        const json_projects = localStorage.getItem('projects')
        if (json_projects){
            this.projects = JSON.parse(json_projects)
        } else { 
            fetch('http://34.125.83.68//api/projects/', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json())
            .then(data => {
                this.projects.push(...data.data)
            })
            .catch(error => {
                console.log(error)
            })
        }
    }
}
</script>

<style>
.page{
    padding: 15px 20px;
    background-color: #eee;
    padding: 10px;
}
h1{
    font-weight: 400;
    font-size: 30px !important; 
    text-align: center;
    padding-top: 30px;
}
#projects{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.card-title{
    font-weight: 300;
    font-size: 18px;
}
.card-body{
    border: 1px solid #eeeeee;
    margin: 10px !important;
    border-radius: 10px;
    background-color: white;

    height: 150px;
    width: 300px;
    display: flex;
    flex-grow: 0 !important;
    align-items: flex-start;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}
.card-body-create{
    border-radius: 10px;
    margin: 10px auto;
    width: 300px;
    display: flex;
    align-items: flex-start;
}
#addproject{
    border: none;
    float: right;
}
.form-control{
    border: none;
    margin: 0;
    padding: 0;
    width: auto;
    margin-right: 10px;

}
.btn-danger{
    margin-left: auto;
}
input[type="text"]
{
    font-size:16px;
}
input:focus{
    background-color: lavender;
}
form{
    display: flex;
}
input{
    float:left;
    margin: 0;
    padding: 0;
}
.card-body p{
    float: left;
}
.btn{
    float:right;
}

</style>