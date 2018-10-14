import { Component, Vue } from "vue-property-decorator";
import debounce from "debounce";

// b-img-lazy nested inside b-carousel issue
// see https://github.com/bootstrap-vue/bootstrap-vue/issues/1210
const updateCarouselImages = debounce(() => {
  window.dispatchEvent(new Event("scroll"));
}, 100);

@Component
class EventBus extends Vue {
  created() {
    this.$on("b:carousel:img:next", updateCarouselImages);
  }
  beforeDestroy() {
    this.$off("b:carousel:img:next", updateCarouselImages);
  }
}

export default new EventBus();
