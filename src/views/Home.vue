<template>
  <div class="home">
    <div id='signin-wrapper'>
      <div v-show="!apiState.principal" id="google-signin-button"></div>    
      <b-button @click="signOut" size='sm' variant='outline-secondary' v-show="apiState.principal" id="google-signout-button">Sign Out</b-button>
    </div>
    <house-rank-app v-if="apiState.principal" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Api from "@/lib/api";
import HouseRankApp from "@/components/HouseRankApp.vue";

@Component({
  components: {
    HouseRankApp
  }
})
export default class Home extends Vue {
  // so Vue can be notified of changes
  apiState = Api.state;
  onSignIn(user: any) {
    Api.onSignIn(user);
  }
  signOut() {
    Api.signOut();
  }
  mounted() {
    Api.renderSignIn("google-signin-button");
  }
}
</script>

<style lang="scss" scoped>
#signin-wrapper {
  // position: relative;
  // top: -5em;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

