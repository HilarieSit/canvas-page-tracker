<template>
    <div>
        <div class="commentspop">
            <div class="header">
                <h2>{{page.type}}: {{page.name}}</h2>
                <button type="button" class="btn-cancel" @click="closeForm">&#10006;</button>
            </div>
            <div class="kanban">
                <div class="kanbanCol" v-for="group in groups" :key="group.label">
                    <h3 v-on:keyup.enter="editCategory(group, $event)"> {{group.label}} </h3>
                    <div class="kanbanComment" contenteditable="true" data-ph="Add note" v-on:keyup.enter="addComment(group.label, $event)"></div>
                    <div class="kanbanComment" v-for="comment in group.comments" :key="comment.id">
                        <p> {{comment.description}} </p>
                        <p class="datetime"> {{comment.datetime}} </p>
                    </div>
                </div>
                <div class="kanbanCol"> 
                    <h3 contenteditable="true" data-ph="Add category" v-on:keyup.enter="addCategory"></h3>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        page: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            groups: [],
            thispage: null,
            comments: []
        };
    },
    methods:{
        getPageData(){
            this.thispage = this.page
            this.groups = this.getGroups(this.thispage.comments, this.comments)
        },
        getGroups(thiscomments, comments){
            let group_names = [];
            let groups = [];
            comments.forEach((item, index) => {group_names[index] = item.label});
            let unique = [...new Set(group_names)];
            for (let i = 0; i < unique.length; i++) {
                var group_comments = thiscomments.filter(obj => {
                return obj.label === unique[i]
                })
                groups.push(
                {'label': unique[i], 
                'comments': group_comments.reverse()
                });
            }
            return groups
        },
        closeForm(event){
            event.target.parentElement.parentElement.parentElement.style.display = "none"
            this.$emit('commentsvisible', false)
        },
        addComment(label, event){
            var description = event.target.innerText.replace(/\s+/, " ")
            event.target.innerHTML = ""
            fetch(`https://a3model.com/api/pages/${this.page.id}/add_comment/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({label: label, description: description, datetime: Date().toLocaleString()})
            })
            .then(resp => resp.json())
            .then(data => {
                const groupIndex = this.groups.findIndex(g => g.label === label)
                this.groups[groupIndex].comments.unshift(data.data)
                this.comments.push(data.data)
                this.$emit('comment', data.data)
            })
            .catch(error => {
                console.log(error)
            })
        },
        addCategory(event){
            var label = event.target.innerText.replace(/\s+/, " ")
            event.target.innerHTML = ""
            event.target.blur()
            this.groups.push({label: label, comments: []})
        },
        editCategory(group, event){
            var label = event.target.innerText.replace(/\s+/, " ")
            event.target.blur()
            const groupIndex = this.groups.findIndex(g => g.label === group.label)
            this.groups[groupIndex].label = label
        }
    },
    watch: {
        comments: {
            handler() {
                if (this.comments){
                    localStorage.setItem(this.page.proj_id+'comments', JSON.stringify(this.comments));
                } else {
                    localStorage.setItem(this.page.proj_id+'comments', 'null')
                }
            },
            deep: true
        },
    },
    created(){
        const proj_id = this.page.proj_id
        // // localStorage.removeItem(proj_id+'comments')
        // const json_comments = localStorage.getItem(proj_id+'comments')
        // if (json_comments){
        //     this.comments = JSON.parse(json_comments)
        //     this.getPageData()
        // } else { 
        //     fetch(`https://a3model.com/api/projects/${proj_id}/get_comments/`, {
        //         method: "GET",
        //         headers: {
        //             "Content-Type": "application/json"
        //         }
        //     })
        //     .then(resp => resp.json())
        //     .then(data => {
        //         this.comments = data.data
        //         this.getPageData()
        //     })
        //     .catch(error => {
        //         console.log(error)
        //     })
        // }
        fetch(`https://a3model.com/api/projects/${proj_id}/get_comments/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json())
            .then(data => {
                this.comments = data.data
                this.getPageData()
            })
            .catch(error => {
                console.log(error)
            })
    }
}
</script>

<style scoped>
h2{
    margin-top: 5px;
    font-size: 25px;
    text-align: center;
    width: 100%;
}
h3{
    font-size: 20px;
    padding: 5px 0;
    font-weight: bold;
    text-align: center;
    border-bottom: 1px solid #aaa;
    border-right: 1px solid #aaa;
    background-color: white;
    position: sticky;
    top: 0;
    z-index: 9;
}
.header{
    display: flex;
    background-color: #ccc;
    border-bottom: 1px solid #aaa;
}
.kanban{
    display: flex;
    height: calc(100% - 43px);
    overflow-x: auto;
}
.kanbanCol{
    overflow-x: hidden;
    flex-shrink: 0;
    width: 300px;
    overflow-y: auto;
    -ms-overflow-style: none; 
    scrollbar-width: none; 
}
.kanbanCol::-webkit-scrollbar { 
    display: none; 
}
.kanbanComment{
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    margin: 10px 5px;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}
.kanbanInput{
    margin-bottom: 5px;
}
#commentspopup{
    background-color: rgba(0,0,0,0.8);
    /* display: none; */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9;
}
.commentspop{
    background-color: #eee;
    position: fixed;
    top: 10%;
    left: 10%;
    width: 80%;
    height: 80%;
    border: 1px solid #aaa;
    z-index: 10;
}
.btn-cancel{
    margin-left: auto;
    border: none;
    font-size: 21px;
    background-color: #ccc;
}
.btn-delete{
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    background: white;
}
input{
    border: none;
}
.datetime{
    position: relative;
    bottom: 0;
    left: 0;
    font-size: 10px;
}
[contenteditable=true]:empty:not(:focus):before{
  content:attr(data-ph);
  color:grey;
  font-style:italic;
}


</style>