<template>
  <div class="task-card">
    <a v-bind:href="page.url" target="_blank"><p id="card-title"><span id="type"><em>{{page.type}}</em>: </span> {{page.name}}</p></a>
    <div id="options">
      <button class="btn btn-light" @click="openNotes">Notes</button>
      <div id="select" :class='getColor(page.status)' @change="editStatus">
        <select name="progress" :value="page.status">
          <option class="green" value="Done">Done</option>
          <option class="purple" value="In Progress">In Progress</option>
          <option class="orange" value="In Review">In Review</option>
          <option class="blue" value="Not Started">Not Started</option>
        </select>
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
  methods: {
    getColor(selected) {
      var color;
      if (selected=="Done"){
        color = 'green'
      } else if (selected=="In Progress") {
        color = 'purple'
      } else if (selected=="In Review") {
        color = 'orange'
      } else if (selected=="Not Started") {
        color = 'red'
      } else {
        color = 'darkgray'
      }
      return color
    },
    editStatus(event){
      fetch(`https://a3model/api/pages/${this.page.id}/edit_status/`, {
          method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({status: event.target.value})
        })
      .then(resp => resp.json())
      .then(data => {
          this.$emit('status', data.data.status)
      })
      .catch(error => {
          console.log(error)
      })
    },
    openNotes(event){
      this.$emit('event', event)
    },
  }
};
</script>
<style scoped>
p{
  width: auto;
  margin: 0;
}
.task-card{
  display: flex;
  align-items: center;
  margin: 0px !important;
}
.btn-link{
  margin-left: auto;
}
#options{
  margin-left: auto;
  display: flex;
}
select{
  background-color: transparent;
  height: 100% !important;
  padding: 8px;
  border: none;
  border-radius: 5px;
}
#select{
  display: inline-block;
  border-radius: 5px;
}
#typeselect{
  background-color: #f8f9fa;
  margin-right: 10px;
}
.btn-light{
  margin-right: 5px;
}
.green {background:#90EE90;}
.purple {background:#CBC3E3;}
.orange {background:#FFE5B4;}
.red {background:#FFCCCB}

#type{
  color: gray;
}
</style>
