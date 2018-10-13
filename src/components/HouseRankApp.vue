<template>
  <div id='app-wrapper'>
    <b-modal title='Request Error' header-text-variant='light' header-bg-variant='danger' v-model="responseError" @ok="dismissResponseError">
      <p class='response-error-wrapper'>{{responseString}}</p>
       <div slot="modal-footer" class="w-100">
         <b-btn size="sm" class="float-right" @click="dismissResponseError">
           OK
         </b-btn>
       </div>
    </b-modal>
    <b-tabs>
      <!-- TODO <house-list-select /> -->
      <b-tab title='Houses'>
        <house-search @house-selected="addHouse" @response-error="displayResponseError" />
        <house-list v-if="houseList" @house-removed="removeHouse" :houses="houseList.houses" />
      </b-tab>
      <!-- TODO <house-ranking-rules /> -->
      <b-tab title="List Members">
        <house-list-member-search @member-selected="addMember" />
        <house-list-members v-if="houseList" @member-removed="removeMember" :members="houseList.members" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import VueRouter, { Route } from "vue-router";
import HouseSearch from "./HouseSearch.vue";
import HouseList from "./HouseList.vue";
import HouseListMembers from "./HouseListMembers.vue";
import HouseListMemberSearch from "./HouseListMemberSearch.vue";
import Api, { commonZillowHouseDataGraphql } from "@/lib/api";

const extendedHouseData = `
  id
  zpid
  ${commonZillowHouseDataGraphql}
`;

@Component({
  components: {
    HouseSearch,
    HouseList,
    HouseListMembers,
    HouseListMemberSearch
  }
})
export default class HouseRankApp extends Vue {
  houseList: any = null;
  $router!: VueRouter;
  $route!: Route;
  listState: any = null;
  responseError: boolean = false;
  responseString: string = "";
  displayResponseError(e: any) {
    console.warn("displayResponseError", e);
    this.responseString = "An error occurred.\n";

    if (e) {
      if (e.errors) {
        this.responseString += e.errors
          .map((error: any) => error.message)
          .join(". ");
      } else {
        this.responseString += JSON.stringify(e, null, " ");
      }
    }
    this.responseError = true;
  }
  dismissResponseError() {
    this.responseString = "";
    this.responseError = false;
  }
  beforeRouteUpdate(to: Route, from: Route, next: Function) {
    next();
  }
  async created() {
    // query lists, set active
    try {
      const resData = await Api.graphqlRequest(`query {
  user {
    ownedHouseLists {
      id
      name
      houses {
        ${extendedHouseData}
      }
      members {
        id
        email
      }
    }
    memberHouseLists {
      id
      name
      houses {
        ${extendedHouseData}
      }
      members {
        id
        email
      }      
    }
  }
}`);

      const listId = +this.$route.params.listId;

      this.listState = resData.user;

      // incoming route param, locate list
      if (listId) {
        // ... in owned lists?
        this.houseList = this.listState.ownedHouseLists.find(
          (l: any) => l.id === listId
        );
        // ... in member lists?
        if (!this.houseList) {
          this.houseList = this.listState.memberHouseLists.find(
            (l: any) => l.id === listId
          );
        }
      }

      // no list!
      if (!this.houseList) {
        if (this.listState.ownedHouseLists.length > 0) {
          // ... take the first owned list
          this.houseList = this.listState.ownedHouseLists[0];
        } else if (this.listState.memberHouseLists.length > 0) {
          // ... otherwise the first member list
          this.houseList = this.listState.memberHouseLists[0];
        }
      }

      // make sure the route is correct
      if (this.houseList) {
        if (this.houseList.id !== listId) {
          // ... by adding the list id
          this.$router.push(`/${this.houseList.id}`);
        }
      } else {
        if (listId) {
          // ... or removing it
          this.$router.push(`/`);
        }
      }
    } catch (e) {
      this.displayResponseError(e);
    }
  }
  async removeMember(userId: number) {
    try {
      const resData = await Api.graphqlRequest(
        `mutation RemoveUserFromList($listId: Int!, $userId: Int!) {
      removeUserFromList(listId: $listId, id: $userId) {
        id
        email
      }
    }`,
        { userId, listId: this.houseList.id }
      );
      const toSplice = (this.houseList.members as any[]).findIndex(
        (m: any) => m.id === userId
      );
      this.houseList.members.splice(toSplice, 1);
      this.houseList = this.houseList;
    } catch (e) {
      this.displayResponseError(e);
    }
  }
  async addMember(email: string) {
    try {
      const resData = await Api.graphqlRequest(
        `mutation AddUserToList($listId: Int!, $email: String!) {
      addUserToList(listId: $listId, email: $email) {
        id
        email
      }
    }`,
        { email, listId: this.houseList.id }
      );
      this.houseList.members.push(resData.addUserToList);
      this.houseList = this.houseList;
    } catch (e) {
      this.displayResponseError(e);
    }
  }

  async removeHouse(zpid: string) {
    // remove house, update list
    try {
      const resData = await Api.graphqlRequest(
        `mutation RemoveHouseFromList($listId: Int!, $zpid: String!) {
      removeHouseFromList(listId: $listId, zpid: $zpid) {
        id
        zpid
      }
    }`,
        { zpid, listId: this.houseList.id }
      );
      const toSplice = (this.houseList.houses as any[]).findIndex(
        (h: any) => h.id === resData.removeHouseFromList.id
      );
      this.houseList.houses.splice(toSplice, 1);
      this.houseList = this.houseList;
    } catch (e) {
      this.displayResponseError(e);
    }
  }
  async addHouse(zpid: string) {
    try {
      if (!this.houseList) {
        const resData = await Api.graphqlRequest(
          `mutation CreateHouseList($name: String!) {
    createHouseList(name: $name) {
      id
      name
      houses {
        ${extendedHouseData}
      }
      members {
        id
        email
      }      
    }
  }`,
          { name: "default" }
        );
        this.houseList = resData.createHouseList;
        this.$router.push(`/${this.houseList.id}`);
      }
      const hasHouse = (this.houseList.houses as any[]).find(
        (h: any) => h.zpid === zpid
      );
      if (hasHouse) return;

      // add house, update list
      const resData = await Api.graphqlRequest(
        `mutation AddHouseToList($listId: Int!, $zpid: String!) {
      addHouseToList(listId: $listId, zpid: $zpid) {
        ${extendedHouseData}
      }
    }`,
        { zpid, listId: this.houseList.id }
      );
      this.houseList.houses.push(resData.addHouseToList);
      this.houseList = this.houseList;
    } catch (e) {
      this.displayResponseError(e);
    }
  }
}
</script>

<style scoped lang="scss">
#app-wrapper {
  margin-bottom: 5em;
  .response-error-wrapper {
    white-space: pre-wrap;
    max-height: 10em;
    overflow-y: auto;
  }
}
</style>
