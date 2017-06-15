const clickoutsideContext = "@@clickoutsideContext";
export default {
  bind(el, binding, vnode) {
    const documentHandler = function(e) {
      if (!vnode.context || el.contains(e.target)) return;
      if (binding.expression) {
        vnode.context[el[clickoutsideContext].methodName](e);
      } else {
        el[clickoutsideContext].bindingFn(e);
      }
    };
    el[clickoutsideContext] = {
      documentHandler,
      methodName: binding.expression,
      bindingFn: binding.value.fn
    };
    console.log(el[clickoutsideContext]);
    setTimeout(() => {
      document.addEventListener("click", documentHandler);
    }, 0);
  },
  update(el, binding) {
    // el[clickoutsideContext].methodName = binding.expression;
    // el[clickoutsideContext].bindingFn = binding.value.fn;
    if (!binding.value.value) {
      document.removeEventListener(
        "click",
        el[clickoutsideContext].documentHandler
      );
    } else {
      setTimeout(() => {
        document.addEventListener(
          "click",
          el[clickoutsideContext].documentHandler
        );
      }, 0);
    }
  },
  unbind(el) {
    document.removeEventListener(
      "click",
      el[clickoutsideContext].documentHandler
    );
  }
};
