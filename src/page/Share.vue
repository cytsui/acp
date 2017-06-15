<template>
  <div>
    <my-button @click="show">分享</my-button>
    <ap-share
    :url="props.url"
    :title="props.title"
    :pic="props.title"
    :summary="props.summary"
    :value.sync="apShareVisiable"
    />
  </div>
</template>

<script>
import { Button } from 'mint-ui'
import { Share, Pop } from '@/apc'


const apShareParams = {
  // props: {
  url: 'http://www.aipai.com',
  title: 'title',
  pic: 'http://res9.weplay.cn/app/www/templates/aipai_platform/pc/index/css/header/logo.png',
  summary: 'summary',
  // }
};

export default {
  name: 'sharePage',
  components: {
    'ap-share': Share,
    'my-button': Button,
  },

  data() {
    return {
      apShareVisiable: false,
      props: {
        url: 'http://www.aipai.com',
        title: 'title',
        pic: 'http://res9.weplay.cn/app/www/templates/aipai_platform/pc/index/css/header/logo.png',
        summary: 'summary',
      },
    }
  },

  methods: {
    show() {
      this.apShareVisiable = true;
    },
  },

  /*
  render(h) {
    const { apShareVisiable } = this;
    return (
      <div>
        <my-button onClick={() => this.apShareVisiable = true}>分享</my-button>
        <ap-share { ...apShareParams } value={apShareVisiable} onCancle={() => this.apShareVisiable = false} />
      </div>
    )
  },
  */
}
</script>

