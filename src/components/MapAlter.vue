<script setup>
import { ref, onMounted, reactive, computed, watch } from "vue";
import { Site } from "../types/DataLocation.ts";
import markerRedIcon from "../assets/marker-red.png";
import markerSparingIcon from "../assets/marker-sparing.png";
import markerOnlimoIcon from "../assets/marker-onlimo.png";
import markerBaseIcon from "../assets/marker-base.png";
import markerSensyncLogo from "../assets/sensync-logo.png";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Text from "ol/style/Text";
import axios from "axios";
import CardPopUp from "./CardPopUp.vue";

const mapRef = ref(null);
const center = ref([118, -2.5]);
const zoom = ref(5);
const popUpProps = reactive({
  name: "",
  address: "",
  status: "Aktif",
  img: "",
});
const popupPosition = ref(null);
const dataSite = ref(Site);
const selectedType = ref(["sparing", "base", "onlimo"]);
const selectedSite = ref("");
const listSelectSite = computed(() => {
  return dataSite.value.filter((site) =>
    selectedType.value.includes(site.tipe)
  );
});
const filteredData = computed(() => {
  if (selectedSite.value != "") {
    return dataSite.value.filter((site) => site.nama === selectedSite.value);
  }
  return dataSite.value.filter((site) =>
    selectedType.value.includes(site.tipe)
  );
});
const deviceData = reactive({
  sparing: [],
  base: { updated: [], not_updated: [] },
  onlimo: [],
  base_krwg: {
    krwg: {
      id: "",
      tempat: "",
      last_update: "",
    },
  },
});
const errorMessage = ref(null);
const selectedSiteCoordinates = computed(() => {
  const site = filteredData.value.find(
    (site) => site.nama === selectedSite.value
  );
  return site
    ? {
        zoom: 10,
        coordinate: [site.Long, site.Lat],
      }
    : {
        zoom: 5,
        coordinate: [118, -2.5],
      };
});

async function getLatesUpdate() {
  try {
    const response = await axios.get(
      "https://api-dashboard.getsensync.com/api/last-update"
    );
    deviceData.base = response.data.base;
    deviceData.base_krwg = response.data.base_krwg;
    deviceData.onlimo = response.data.onlimo;
    deviceData.sparing = response.data.sparing;
    checkStatus();
  } catch (error) {
    console.log(error);
    errorMessage.value = error.message;
  }
}

function checkStatus() {
  const now = new Date();

  const deviceLastUpdateMap = new Map();
  // add sparing to map
  deviceData.sparing.forEach((device) => {
    deviceLastUpdateMap.set(device.id_device, new Date(device.last_update));
  });
  // add onlimo to map
  deviceData.onlimo.forEach((device) => {
    deviceLastUpdateMap.set(device.id_device, new Date(device.last_update));
  });

  // add base krwg to map
  deviceLastUpdateMap.set(
    deviceData.base_krwg.krwg.id,
    new Date(deviceData.base_krwg.krwg.last_update)
  );

  // add base klhk to new set
  const updatedSet = new Set(deviceData.base.updated.map((b) => b.id));
  const notUpdatedSet = new Set(deviceData.base.not_updated.map((b) => b.id));

  dataSite.value.forEach((site) => {
    if (deviceLastUpdateMap.has(site.id)) {
      // Jika ada last_update, cek apakah masih dalam 30 menit terakhir
      const lastUpdateTime = deviceLastUpdateMap.get(site.id);
      const diffMinutes = (now - lastUpdateTime) / 60000;
      site.status = diffMinutes <= 30 ? "Online" : "Maintenance";
    } else if (updatedSet.has(site.id)) {
      site.status = "Online";
    } else if (notUpdatedSet.has(site.id)) {
      site.status = "Maintenance";
    } else {
      site.status = "Undefined";
    }
  });
}

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
    const iconSrc = markerSensyncLogo;

    return new Style({
      image: new Icon({
        src: iconSrc,
        scale: 0.225,
      }),
    });
  } else {
    const dominantType = getDominantType(clusteredFeatures);
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

watch(selectedSiteCoordinates, (newCoords) => {
  if (mapRef.value) {
    const view = mapRef.value.map.getView();
    view.animate({
      center: newCoords.coordinate,
      zoom: newCoords.zoom,
      duration: 1000, // Durasi animasi dalam milidetik (1 detik)
    });
  }
});

onMounted(() => {
  getLatesUpdate();
  setInterval(getLatesUpdate, 1800000);
});

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
          popUpProps.status = foundMarker.status;
          popUpProps.img = foundMarker.img
            ? foundMarker.img
            : "https://placehold.co/200x150?text=Image";

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

  <select class="select search-input" v-model="selectedSite">
    <option selected value="">All Site</option>
    <option v-for="site in listSelectSite" :key="site.id" :value="site.nama">
      {{ site.nama }} ({{ site.tipe }})
    </option>
  </select>

  <ol-map ref="mapRef" style="width: 100%; height: 90vh">
    <ol-view :center="center" :zoom="zoom" projection="EPSG:4326" />

    <!-- Layer OpenStreetMap -->
    <!-- <ol-tile-layer>
      <ol-source-xyz
        url="https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
    </ol-tile-layer> -->
    <ol-tile-layer>
      <ol-source-xyz
        url="https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
    </ol-tile-layer>
    <!-- <ol-tile-layer>
      <ol-source-xyz url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
    </ol-tile-layer> -->

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
      <CardPopUp
        class="popup"
        :name="popUpProps.name"
        :address="popUpProps.address"
        :status="popUpProps.status"
        :img="popUpProps.img"
      />
      <!-- <div class="popup max-w-3xs">
        <h3 class="font-bold text-lg">{{ popUpProps.name }}</h3>
        <span class="text-sm line-clamp-2">{{ popUpProps.address }}</span>
        <div
          class="w-full h-fit"
          :class="popUpProps.status == 'Aktif' ? 'bg-success' : 'bg-error'"
        >
          <span class="text-center line-clamp-2 font-bold text-white mt-2">{{
            popUpProps.status
          }}</span>
        </div>
      </div> -->
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

.search-input {
  position: absolute;
  top: 90px;
  right: 20px;
  border-radius: 5px;
  z-index: 998;
}
</style>
