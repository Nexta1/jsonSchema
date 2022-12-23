<template>
  <div class="app">
    <div>
      <json-schema :value="value" />
    </div>
    <div>
    </div>
  </div>
</template>

<script>

export default {

  data(){
    return{
      value:{
        root: {
          type: "object",
          title: "条件",
          properties: {
            name: {
              type: "string",
              title: "名称",
              maxLength: 10,
              minLength: 2,
            },
            appId: {
              type: "integer",
              title: "应用ID",
            },
            credate: {
              type: "string",
              title: "创建日期",
              format: "date",
            },
          },
          required: ["name", "appId", "credate"],
        },
      },
      tree:{}
    }
  },
  watch:{
    value:{
      handler:function (a){
        console.log(a)
      },
      deep:true
    }
  }
}
</script>

<style  scoped>
.app{
  display: flex;

}
</style>
