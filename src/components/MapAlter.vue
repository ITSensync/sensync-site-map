<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { Site } from "../types/DataLocation.ts";
import markerRedIcon from "../assets/marker-red.png";
import markerSparingIcon from "../assets/marker-sparing.png";
import markerOnlimoIcon from "../assets/marker-onlimo.png";
import markerBaseIcon from "../assets/marker-base.png";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Text from "ol/style/Text";

const mapRef = ref(null);
const center = ref([118, -2.5]);
const zoom = ref(5);
const popUpProps = reactive({
  name: "",
  address: "",
  status: "Aktif",
});
const popupPosition = ref(null);
const dataSite = ref(Site);
const selectedType = ref(["sparing", "base", "onlimo"]);
const filteredData = computed(() => {
  return dataSite.value.filter((site) =>
    selectedType.value.includes(site.tipe)
  );
});

const getMarkerIcon = (type) => {
  switch (type) {
    case "sparing":
      return markerSparingIcon;
    case "onlimo":
      return markerOnlimoIcon;
    case "base":
      return markerBaseIcon;
    default:
      return markerRedIcon;
  }
};

const getDominantType = (features) => {
  const count = {};

  features.forEach((feature) => {
    const type = feature.get("type"); // Ambil tipe dari properties
    count[type] = (count[type] || 0) + 1;
  });

  return Object.keys(count).reduce((a, b) => (count[a] > count[b] ? a : b));
};

const typeColors = {
  sparing: "rgba(43, 127, 255, 0.7)", // Biru
  onlimo: "rgba(255, 137, 4, 0.7)", // Oranye
  base: "rgba(137, 14, 178, 0.7)", // Ungu
};

// Custom style untuk cluster & marker
const overrideStyleFunction = (feature) => {
  const clusteredFeatures = feature.get("features");
  const size = clusteredFeatures.length;

  if (size === 1) {
    const properties = clusteredFeatures[0].getProperties();
    const iconSrc = getMarkerIcon(properties.type);

    return new Style({
      image: new Icon({
        src: iconSrc,
        scale: 0.1,
      }),
    });
  } else {
    const dominantType = getDominantType(clusteredFeatures);
    console.log(dominantType);
    const fillColor = typeColors[dominantType] || "rgba(200, 200, 200, 0.6)";

    return new Style({
      image: new Circle({
        radius: 20,
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: "white", width: 0 }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({ color: "#fff" }),
        stroke: new Stroke({ color: "#fff", width: 0 }),
      }),
    });
  }
};

// Menangkap event klik di peta
onMounted(() => {
  if (mapRef.value) {
    mapRef.value.map.on("click", (event) => {
      const feature = mapRef.value.map.forEachFeatureAtPixel(
        event.pixel,
        (feat) => feat
      );

      if (feature) {
        const properties = feature.get("features"); // Clustered feature
        if (properties && properties.length === 1) {
          const coordinate = properties[0].getGeometry().getCoordinates();

          const foundMarker = dataSite.value.find((marker) => {
            return (
              marker.Long === coordinate[0] && marker.Lat === coordinate[1]
            );
          });

          popUpProps.name = foundMarker ? foundMarker.nama : "No Name";
          popUpProps.address = foundMarker.alamat;

          popupPosition.value = coordinate;
        } else {
          popupPosition.value = null;
        }
      } else {
        popupPosition.value = null;
      }
    });
  }
});
</script>

<template>
  <div class="filters">
    <label v-for="type in ['sparing', 'onlimo', 'base']" :key="type">
      <input type="checkbox" v-model="selectedType" :value="type" />
      {{ type.charAt(0).toUpperCase() + type.slice(1) }}
    </label>
  </div>

  <ol-map ref="mapRef" style="width: 100%; height: 90vh">
    <ol-view :center="center" :zoom="zoom" projection="EPSG:4326" />

    <!-- Layer OpenStreetMap -->
    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <!-- Layer Marker -->
    <ol-vector-layer>
      <ol-source-cluster :distance="30">
        <ol-source-vector>
          <ol-feature
            v-for="site in filteredData"
            :key="site.id"
            :properties="{ type: site.tipe }"
          >
            <ol-geom-point :coordinates="[site.Long, site.Lat]" />
          </ol-feature>
        </ol-source-vector>
      </ol-source-cluster>

      <ol-style :overrideStyleFunction="overrideStyleFunction" />
    </ol-vector-layer>

    <!-- Popup -->
    <ol-overlay v-if="popupPosition" :position="popupPosition">
      <div class="popup max-w-3xs">
        <h3 class="font-bold text-lg">{{ popUpProps.name }}</h3>
        <span class="text-sm line-clamp-2">{{ popUpProps.address }}</span>
        <div class="w-full bg-success h-fit">
          <span class="text-center line-clamp-2 font-bold text-white mt-2">{{
            popUpProps.status
          }}</span>
        </div>
      </div>
    </ol-overlay>
  </ol-map>

  <div class="info-legend">
    <div class="flex flex-row items-center gap-2">
      <div class="w-4 h-4 border bg-blue-500"></div>
      <p class="font-semibold">: QUA - Sparing</p>
    </div>
    <div class="flex flex-row items-center gap-2">
      <div class="w-4 h-4 border bg-orange-400"></div>
      <p class="font-semibold">: QUA - Onlimo</p>
    </div>
    <div class="flex flex-row items-center gap-2">
      <div class="w-4 h-4 border bg-violet-500"></div>
      <p class="font-semibold">: BASE - AQMS</p>
    </div>
  </div>
</template>

<style>
.filters {
  position: absolute;
  top: 10px;
  left: 10px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 999;
  display: flex;
  gap: 10px;
}

.popup {
  background: white;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid black;
  font-size: 14px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
}

.info-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 998;
}
</style>
