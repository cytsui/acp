export default {
  functional: true,
  props: {
    data: {
      type: Object,
      required: true
    }
  },

  render(h, ctx) {
    const data = ctx.props.data;
    let showComponents;

    if (data.type === 1) {
      showComponents = (
        <div class="follow-follow">
          <p>成功关注{data.name}</p>
          <a>进入空间</a>
          <a>返回</a>
        </div>
      );
    } else {
      showComponents = (
        <div class="followed-follow">
          <p>你已经关注{data.name}</p>
          <a>取消关注</a>
          <a>返回</a>
        </div>
      );
    }
    return <div>{showComponents}</div>;
  }
};
