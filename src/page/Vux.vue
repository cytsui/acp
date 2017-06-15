<template>
  <div>

    <ul class="usr-list">
      <li v-for="item in userList">
        <p @click="show(item.bid)" >关注{{item.name}}</p>
      </li>
    </ul>

    <PopFans :value.sync="visiable" :hideOnBlur="true" :usr="userList[0]"></PopFans>

  </div>
</template>

<script>
import { Share, PopFans } from '@/apc'
import { dataList } from '@/mock/mock.js'

export default {
  name: 'VuxDemo',
  components: {
    PopFans,
  },

  data() {
    return {
      visiable: false,
      userList: dataList,
    }
  },

  methods: {
    show(bid) {
      console.log(bid);
      this.visiable = true;
    },
  }
}
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}

li {
  list-style: none;
  border: none;
}

.usr-list {
  padding: 10px 0;

  li {
    height: 30px;
    line-height: 30px;
    background: #ccc;
    margin-bottom: 10px;
    p {
      height: 30px;
      line-height: 30px;
    }
  }
}
</style>
