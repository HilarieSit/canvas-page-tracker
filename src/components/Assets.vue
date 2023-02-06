<template>
    <div class="page">
      <h1>{{projectname}} </h1>
      <div>
        <draggable v-bind:list="groups" item-key="id" animation="200" group="group">
          <template #item="{ element }">
            <div>
              <div class="group-title">
                <p contenteditable="true">{{element.name}}</p>
              </div>
              <draggable v-bind:list="element.pages" :item-key="id" :ref="element.color" :animation="200" ghost-class="ghost-card" group="assets" class="assets-drag" handle='.handle' @end="dragEnd">
                <template #item="{ element }">
                  <div style="display:flex;">
                    <button class="handle" @mousedown="dragHandle(element)">&#8942;</button>
                    <div class="list-group-item">
                      <page-card
                          :page="element"
                          @status="updateStatus(element, $event)"
                          @comments="updateComments(element, $event)"
                          @event="getClickEvent(element)"
                      ></page-card>
                    </div>
                    <button class="btn-edit" @click="showEditForm(element)">&#x270E;</button>
                  </div>
                </template>
              </draggable>
              <button id="createpage" @click="showForm(element)"> + Add Page </button>
            </div>
          </template>
        </draggable>
        <div class="group-title">
          <input class="add-group" v-model="newgroup" placeholder="+ New Module" v-on:keyup.enter="addGroup">
        </div>
        <!-- Add form -->
        <div class="form-popup" id="addForm">
          <form class="form-container" @submit.prevent="addAsset">
            <button type="button" class="btn-cancel" @click="closeForm">&#10006;</button>
            <h3>New Page</h3>
            <label for="type"><b>Type</b></label>
            <input type="text" placeholder="Enter Page Type" name="type" required>

            <label for="title"><b>Title</b></label>
            <input type="text" placeholder="Enter Title" name="title" required>

            <label for="url"><b>URL</b></label>
            <input type="url" placeholder="Enter Page URL" name="url">

            <button type="submit" class="btn btn-success btn-form">Submit</button>
          </form>
        </div>
        <!-- Edit form -->
        <div class="form-popup" id="editForm">
          <form class="form-container" @submit.prevent="editAsset">
            <button type="button" class="btn-cancel" @click="closeForm">&#10006;</button>
            <h3>Edit Page</h3>
            <label for="type"><b>Type</b></label>
            <input type="text" placeholder="Enter Page Type" name="type" v-model="page.type" required>

            <label for="title"><b>Title</b></label>
            <input type="text" placeholder="Enter Title" name="title" v-model="page.name" required>

            <label for="url"><b>URL</b></label>
            <input type="url" placeholder="Enter Page URL" name="url" v-model="page.url" required>

            <button class="btn btn-danger btn-form" @click="deleteAsset">Delete Page</button>
            <button type="submit" class="btn btn-success btn-form">Submit</button>
          </form>
        </div>
        <comments-popup id="commentspopup" v-if="commentsvisible"
          :page="cPage"
          @comment="addComment"
          @commentsvisible="exitCommentsPopup"
        ></comments-popup>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import PageCard from "./PageCard.vue";
import CommentsPopup from "./CommentsPopup.vue";
export default {
  name: "App",
  components: {
    PageCard,
    CommentsPopup,
    draggable
  },
  props: {
    id:{
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      projectname: '',
      projectid: 0,
      newgroup: '',
      groupname: '',
      groups: [],
      cModule: null,
      cPage: null,
      draggedpage: {'id': null, 'position': null, 'type': null, 'module': null, 'name': null, 'url': null, 'status': null},
      page: {'id': null, 'position': null, 'type': null, 'module': null, 'name': null, 'url': null, 'status': null},
      commentsvisible: false
    };
  },
  methods:{
    getGroups(assets){
      let group_names = [];
      let groups = [];
      assets.forEach((item, index) => {group_names[index] = item.module});
      let unique = [...new Set(group_names)];
      for (let i = 0; i < unique.length; i++) {
        var group_assets = assets.filter(obj => {
          return obj.module === unique[i]
        })
        groups.push(
          {'name': unique[i], 
          'pages': group_assets
          });
      }
      for (let i = 0; i < groups.length; i++){
        groups[i].pages = groups[i].pages.sort((a, b) => a.position - b.position)
      }
      return groups
    },
    showForm(element){
      document.getElementById("addForm").style.display = "inline-block"
      this.groupname=element.name
    },
    showEditForm(element){
      document.getElementById("editForm").style.display = "inline-block"
      this.page = element
      this.cModule = element.module
    },
    closeForm(){
      document.getElementById("addForm").style.display = "none"
      document.getElementById("editForm").style.display = "none"
    },
    addAsset(event){
      var elements = event.target.elements
        fetch(`https://a3model.com/api/projects/${this.id}/add_page/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name: elements.title.value, type: elements.type.value, module: this.groupname, url: elements.url.value, status: 'Not Started'})
        })
        .then(resp => resp.json())
        .then(data => {
            this.groups[this.groups.findIndex(x => x.name === this.groupname)].pages.push(data.data)
            this.closeForm();
        })
        .catch(error => {
            console.log(error)
        })
    },
    editAsset(){
      fetch(`https://a3model.com/api/pages/${this.page.id}/`, {
          method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({type: this.page.type, name: this.page.name, url: this.page.url})
        })
      .then(resp => resp.json())
      .then(() => {
          this.closeForm();
      })
      .catch(error => {
          console.log(error)
      })
    },
    deleteAsset(){
      fetch(`https://a3model.com/api/pages/${this.page.id}/`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json"
          }
      })
      .then(() => {
          const moduleIndex = this.groups.findIndex(g => g.name === this.cModule)
          const pageIndex = this.groups[moduleIndex].pages.findIndex(p => p.id === this.page.id)
          this.groups[moduleIndex].pages.splice(pageIndex, 1)
          this.closeForm()
      })
      .catch(error => {
          console.log(error)
      })
    },
    updateStatus(element, status){
      element.status = status
    },
    updateComments(element, comment){
      element.comments = element.comments.push(comment)
    },
    dragEnd(event){
      var newModule = event.to.previousSibling.innerText
      const moduleIndex = this.groups.findIndex(g => g.name === newModule)
      const pageIndex = this.groups[moduleIndex].pages.findIndex(p => p.id === this.draggedpage.id)
      var pages = this.groups[moduleIndex].pages
      pages[pageIndex].module = newModule
      if (pageIndex == 0){
        pages[pageIndex].position = pages[pageIndex+1].position - 100
      } else if (pageIndex == pages.length-1) {
        pages[pageIndex].position = pages[pageIndex-1].position + 100
      } else {
        pages[pageIndex].position = (pages[pageIndex-1].position+pages[pageIndex+1].position)/2
      }
      fetch(`https://a3model.com/api/pages/${pages[pageIndex].id}/edit_position/`, {
        method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
              body: JSON.stringify({position: pages[pageIndex].position, module: pages[pageIndex].module})
          })
        .then(resp => resp.json())
        .then(() => {
        })
        .catch(error => {
            console.log(error)
        })
    },
    dragHandle(element){
      this.draggedpage = element
    },
    addGroup(){
      if (this.newgroup.trim().length > 0){
        let group = {'name': this.newgroup, 'pages': []} 
        this.groups.push(group)
      }
    },
    getClickEvent(element){
      this.commentsvisible = true;
      this.cPage = element
    },
    exitCommentsPopup(commentsvisible){
      this.commentsvisible = commentsvisible
    },
    addComment(comment){
      const moduleIndex = this.groups.findIndex(g => g.name === this.cPage.module)
      const pageIndex = this.groups[moduleIndex].pages.findIndex(p => p.id === this.cPage.id)
      this.groups[moduleIndex].pages[pageIndex].comments.push(comment)
    }
  },
  watch: {
    groups: {
      handler() {
        if (this.groups){
          localStorage.setItem(this.id+'groups', JSON.stringify(this.groups))
        } else {
          localStorage.setItem(this.id+'groups', 'null')
        }
      },
      deep: true
    },
    projectname: {
      handler() {
        if (this.projectname){
          localStorage.setItem(this.id+'projectname', JSON.stringify(this.projectname))
        } else {
          localStorage.setItem(this.id+'projectname', 'null')
        }
      },
      deep: true
    }
  },
  created(){
    // if (localStorage.getItem(this.id+'groups')){
    //   this.groups = JSON.parse(localStorage.getItem(this.id+'groups'))
    //   if (localStorage.getItem(this.id+'projectname')){
    //     this.projectname = JSON.parse(localStorage.getItem(this.id+'projectname'))
    //   }
    // } 
    // else {
    //   fetch(`https://a3model.com/api/projects/${this.id}/`, {
    //       method: "GET",
    //       headers: {
    //           "Content-Type": "application/json"
    //       }
    //   })
    //   .then(resp => resp.json())
    //   .then(data => {
    //       this.projectname = data.data.name
    //       this.groups = this.getGroups(data.data.pages)
    //   })
    //   .catch(error => {
    //       console.log(error)
    //   })
    // }
    fetch(`https://a3model.com/api/projects/${this.id}/`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json"
          }
      })
      .then(resp => resp.json())
      .then(data => {
          this.projectname = data.data.name
          this.groups = this.getGroups(data.data.pages)
      })
      .catch(error => {
          console.log(error)
      })
  }
};
</script>

<style scoped>
h1{
    font-weight: 400;
    text-align: center;
    padding-top: 30px;
}
h3{
  text-align: center;
  margin-top: 20px;
}
.page{
    padding: 20px;
    overflow-x: hidden;
    max-width: 1000px;
    margin: 0 auto;
}
.column-width {
  min-width: 320px;
  width: 320px;
}
.group{
    width: 100%;
}
.group-title, .add-group{
    font-size: 24px;
    font-weight: bold;
    margin: 15px 0px 5px;
    padding-top: 20px;
    width: 100%;
    display: flex;
    align-items: center;
}
.add-group{
  margin: 0px 10px 0px 5px;
  background-color: #eee;
  border: none;
}
.group-title p{
  margin: 0;
}
.create-btn{
    float: left;
    border: 0;
    outline: 0;
}
.create-btn:focus {
    border: 0;
    outline: 0;
}
#createpage{
  border: none;
  float: right;
  background: #eee;
}
.bulkadd{
  font-size: 16px;
}
.hidden{
  display: none;
}
.edit-pencil{
  margin-left: 20px;
}
.r-icon{
  background-color: #555;
  margin-right: 10px; 
  color: white;
  width: 12px;
  height: 12px;
  padding: 6px;
  font-size: 10px;
  border-radius: 15px;
}
.x, .plus{
  margin-left: auto;
}
.plus{
  background-color: white;
  color: green;
}
.gripdots{
  margin-left: 3px; 
  margin-right: 10px; 
  padding: 3px;
}
.plus{
  width: 16px;
  height: 16px;
  padding: 3px;
}
.rotated {
  transform: rotate(90deg);
}
.r-icon:hover{
  filter: brightness(125%);
}
.delete{
  display: none;
  font-size: 12px;
  font-weight: lighter;
  margin-left: auto;
}

.form-popup {
  display: none;
  position: fixed;
  bottom: 0;
  right: 15px;
  border: 3px solid #f1f1f1;
  z-index: 9;
}

/* Add styles to the form container */
.form-container {
  display: inline-block;
  max-width: 400px;
  padding: 10px;
  background-color: white;
}
.form-container label{
  width: 100%;
}
.form-container input {
  width: 100%;
  padding: 15px;
  margin: 5px 0 15px 0;
  border: none;
  background: #f1f1f1;
}

select{
  display: inline-block;
  padding: 15px;
  width: 100%;
  border: none;
  background: #f1f1f1;
}

.btn-cancel{
  float: right;
  border: none;
}

.list-group-item{
  flex: 1 0 auto;
  max-width: calc(100% - 28px - 26px);
}
.btn-edit{
  flex: 0 1 20px;
  border: none;
  transform: rotateY(180deg);
  background: #eee;
}
.handle{
  border: 1px solid rgba(0,0,0,.125);
  font-size: 30px;
  background-color: #fff;
}

.list-group-item{
  padding: 0;
  margin: 0;
  align-items: center;
}

.btn-form{
  margin-top: 15px;
}

.btn-danger{
  float: left;
}
</style>
