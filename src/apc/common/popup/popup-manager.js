let hasModal = false;

function getModal() {
  let modalDom = PopupManager.modalDom;

  if (modalDom) {
    hasModal = true;
  } else {
    hasModal = false;
    modalDom = document.createElement("div");
    PopupManager.modalDom = modalDom;

    modalDom.addEventListener("touchmove", function(event) {
      event.preventDefault();
      event.stopPropagation();
    });

    modalDom.addEventListener("click", function() {
      PopupManager.doOnModalClick && PopupManager.doOnModalClick();
    });
  }
  return modalDom;
}

const PopupManager = {

  openModal(){
    const modalDom = getModal();
    modalDom.setAttribute('class', 'v-modal');

    document.body.appendChild(modalDom);  // 添加遮罩层
  },

  closeModal(){
    const modalDom = getModal();

    modalDom.parentNode.removeChild(modalDom);  // 删除遮罩层
  },
};

export default PopupManager;
