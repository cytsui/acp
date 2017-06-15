<template>
  <XDialog v-model="visiable" :hideOnBlur="hideOnBlur">

  </XDialog>
</template>

<script>
import { XDialog } from 'vux'
import Controller from './controller.js'

export default {
  name: 'popFans',
  components: {
    XDialog,
    Controller,
  },

  // PopFans API
  props: {
    usr: {
      type: Object,
      default: null,
    },
    'value': {
      type: Boolean,
      default: false,
    },
    'hideOnBlur': {
      type: Boolean,
      default: false,
    },
    'scroll': {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      visiable: this.value,
    }
  },

  methods: {

  },

  watch: {
    value(val){
      console.log('value:', val);
      this.visiable = val;
    },

    visiable(val){
      console.log('visiable:', val);
      if(val === true){
        console.log('显示true, 该拿数据了', this.usr);
      }
      this.$emit('update:value', val)
    },
  },

}

</script>

<style lang="less"></style>
