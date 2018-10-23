<template>
  <div id='app-wrapper'>
    <house-details-modal
      v-if="house"
      @house-selected="houseAction"
      @house-selected-alt="houseActionAlt"
      :select-option="houseActionText"
      :select-option-alt="houseActionTextAlt"
      @response-error="displayResponseError"
      @close="hideHouseDetails"
      :house="house"
    ></house-details-modal>
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
        <house-list-map :houses="houses" :houses-ignored="ignoredHouses" />
        <house-list @house-removed="removeHouse" :houses="houses" />
      </b-tab>
      <!-- TODO <house-ranking-rules /> -->
      <b-tab title="List Members">
        <house-list-member-search @member-selected="addMember" />
        <house-list-members @member-removed="removeMember" :members="members" />
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
import HouseListMap from "./HouseListMap.vue";
import HouseListMemberSearch from "./HouseListMemberSearch.vue";
import Api, { commonZillowHouseDataGraphql } from "@/lib/api";
import HouseDetailsModal from "@/components/HouseDetailsModal.vue";
import eventBus from "@/lib/events";
import { HouseModel } from "@/lib/house";

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
    HouseListMemberSearch,
    HouseListMap,
    HouseDetailsModal
  }
})
export default class HouseRankApp extends Vue {
  house: any = null;
  houseList: any = null;
  $router!: VueRouter;
  $route!: Route;
  listState: any = null;
  responseError: boolean = false;
  responseString: string = "";
  beforeDestroy() {
    eventBus.$off("house:modal:show", this.showHouseDetails);
  }
  showHouseDetails(house: any) {
    this.house = house;
  }
  hideHouseDetails() {
    this.house = null;
  }
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
  get houseActionTextAlt(): string {
    if (!this.house) {
      return "";
    }
    const found = this.ignoredHouses.find(
      (h: any) => h.zpid === this.house.zpid
    );
    if (found) {
      return "Remove from Ignored List";
    }
    return "Add to Ignored List";
  }
  houseActionAlt(house: HouseModel) {
    if (!this.house) {
      return;
    }
    const found = this.ignoredHouses.find(
      (h: any) => h.zpid === this.house.zpid
    );
    if (found) {
      this.clearIgnoredHouse(house.zpid);
      return;
    }
    this.ignoreHouse(house.zpid);
  }

  get houseActionText(): string {
    if (!this.house) {
      return "";
    }
    const found = this.houses.find((h: any) => h.zpid === this.house.zpid);
    if (found) {
      return "Remove from List";
    }
    return "Add to List";
  }
  houseAction(house: HouseModel) {
    if (!this.house) {
      return;
    }
    const found = this.houses.find((h: any) => h.zpid === this.house.zpid);
    if (found) {
      this.removeHouse(house.zpid);
      return;
    }
    this.addHouse(house.zpid);
  }
  get ignoredHouses() {
    return this.listState && this.listState.ignoredHouses
      ? this.listState.ignoredHouses
      : [];
  }
  get houses() {
    return this.houseList ? this.houseList.houses : [];
  }
  get members() {
    return this.houseList ? this.houseList.members : [];
  }
  dismissResponseError() {
    this.responseString = "";
    this.responseError = false;
  }
  beforeRouteUpdate(to: Route, from: Route, next: Function) {
    next();
  }
  async created() {
    this.showHouseDetails = this.showHouseDetails.bind(this);
    eventBus.$on("house:modal:show", this.showHouseDetails);
    // query lists, set active
    try {
      const resData = await Api.graphqlRequest(`query {
  user {
    ignoredHouses {
      id
      zpid
    }
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
        } // else no lists yet at all!
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
      await Api.graphqlRequest(
        `mutation RemoveHouseFromList($listId: Int!, $zpid: String!) {
      removeHouseFromList(listId: $listId, zpid: $zpid) {
        id
        zpid
      }
    }`,
        { zpid, listId: this.houseList.id }
      );
      const toSplice = (this.houseList.houses as any[]).findIndex(
        (h: any) => h.zpid === zpid
      );
      if (toSplice === -1) return;
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

  async ignoreHouse(zpid: string) {
    // add house, update list
    try {
      const resData = await Api.graphqlRequest(
        `mutation IgnoreHouse($zpid: String!) {
      ignoreHouse(zpid: $zpid) {
        id
        zpid
      }
    }`,
        { zpid }
      );

      const hasHouse = (this.listState.ignoredHouses as any[]).find(
        (h: any) => h.zpid === zpid
      );
      if (hasHouse) return;

      (this.listState.ignoredHouses as any[]).push(resData.ignoreHouse);
      this.listState = this.listState;
    } catch (e) {
      this.displayResponseError(e);
    }
  }

  async clearIgnoredHouse(zpid: string) {
    // remove house, update list
    try {
      await Api.graphqlRequest(
        `mutation ClearIgnoredHouse($zpid: String!) {
      clearIgnoredHouse(zpid: $zpid) {
        id
        zpid
      }
    }`,
        { zpid }
      );
      const toSplice = (this.listState.ignoredHouses as any[]).findIndex(
        (h: any) => h.zpid === zpid
      );
      if (toSplice === -1) return;
      (this.listState.ignoredHouses as any[]).splice(toSplice, 1);
      this.listState = this.listState;
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
