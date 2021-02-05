<template>
  <visual-editor v-model="jsonData" :config="visualConfig" />
</template>

<script lang="ts">
import { defineComponent }    from 'vue';
import VisualEditor from './packags/visual-editor';
import {visualConfig} from './visual.config'
export default defineComponent({
  name: 'App',
  components: {VisualEditor},
  data(){
    return {
      visualConfig,
      jsonData: {
        container: {
          width: 800,
          height:500
        },
        blocks: [
          {top: 100, left:100,componentKey:'button',width:0,height:0},
          {top: 200, left: 200,componentKey:'input',width:0,height:0},
          {top: 50, left: 200,componentKey:'text',width:0,height:0},
        ]
      }
    }
  },
});
</script>

<style lang="scss">
html,body{
  margin: 0;
  padding: 0;
}


</style>

