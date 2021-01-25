<template>
  <visual-editor v-model="jsonData" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VisualEditor from './packags/visual-editor';
export default defineComponent({
  name: 'App',
  components: {VisualEditor},
  data(){
    return {
      jsonData: {
        container: {
          width: 800,
          height:500
        },
        blocks: [
          {top: 100, left:100},
          {top: 200, left: 200}
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
