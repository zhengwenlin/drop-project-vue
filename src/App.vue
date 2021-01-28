<template>
  <visual-editor v-model="jsonData" :config="visualConfig" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
          {top: 100, left:100,componentKey:'button'},
          {top: 200, left: 200,componentKey:'input'},
          {top: 50, left: 200,componentKey:'text'},
        ]
      }
    }
  }
});
</script>

<style lang="scss">
html,body{
  margin: 0;
  padding: 0;
}
</style>

