import Api from "@/lib/api";
import eventBus from "@/lib/events";
export interface Location {
  latitude: number;
  longitude: number;
}

export class LocationApi {
  state: { location?: Location } = {};
  constructor() {
    eventBus.$on("api:signed-in", this.fetchRelative);
  }
  locationAvailable() {
    eventBus.$emit("location:available", this.state.location);
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
        console.info("loaded relative location", resData.location);
        this.state = resData;
        this.locationAvailable();
      } else {
        this.fetchPrecise();
      }
    } catch (e) {
      console.warn("failed to fetch relative location", e);
    }
  };
  fetchPrecise() {
    if (!navigator || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      p => {
        console.info("loaded precise location", p.coords);
        const { longitude, latitude } = p.coords;
        this.state = { location: { latitude, longitude } };
        this.locationAvailable();
      },
      e => {
        console.warn("failed to fetch precise location", e);
      }
    );
  }
}

export default new LocationApi();
