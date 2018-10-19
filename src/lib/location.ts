import Api from "@/lib/api";
import eventBus from "@/lib/events";
export interface Location {
  latitude: number;
  longitude: number;
}

export class LocationApi {
  state: { location?: Location } = {};
  constructor() {
    eventBus.$once("api:signed-in", this.fetchRelative);
  }
  fetchRelative = async () => {
    try {
      const resData = await Api.graphqlRequest(`query {
            location {
                latitude
                longitude
            }
        }`);
      if (resData.location) {
        this.state = resData;
      } else {
        this.fetchPrecise();
      }
    } catch (e) {
      console.warn(e);
    }
  };
  fetchPrecise() {
    if (!navigator || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(p => {
      const { longitude, latitude } = p.coords;
      this.state = { location: { latitude, longitude } };
    });
  }
}

export default new LocationApi();
