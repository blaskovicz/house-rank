<template>
  <div id="app">
    <!-- <div id="nav"> -->
      <!-- <router-link to="/">Home</router-link> | -->
      <!-- <router-link to="/about">About</router-link> -->
    <!-- </div> -->
    <b-jumbotron>
        <template slot="header">
          <a href="/" style="color:inherit">House Rank</a>
        </template>
    </b-jumbotron>    
    <b-container fluid>
      <router-view/>
    </b-container>
    <footer>
      <a href="https://zillow.com" target="_blank" rel="noopener noreferrer">
        <img src="http://www.zillow.com/widgets/GetVersionedResource.htm?path=/static/logos/Zillowlogo_200x50.gif" width="200" height="50" alt="Zillow Real Estate Search">
      </a>
    </footer>
  </div>
</template>

<script lang="ts">
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import { Component, Vue } from "vue-property-decorator";

Vue.use(BootstrapVue);
@Component({
  components: {}
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
