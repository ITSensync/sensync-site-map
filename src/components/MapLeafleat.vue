<script setup lang="ts">
import { ref, onMounted } from "vue";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import { LMarkerClusterGroup } from "vue-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css";
import "leaflet-extra-markers";
import axios from "axios";

const data = [
  {
    id: "sparing01",
    nama: "Gistex",
    alamat:
      "Jl. Nanjung No.82, Lagadar, Kec. Margaasih, Kabupaten Bandung, Jawa Barat 40216, Indonesia",
    Lat: -6.9374571,
    Long: 107.5364919,
    tipe: "sparing",
  },
  {
    id: "sparing02",
    nama: "Indorama PWK",
    alamat:
      "Jl. Industri Ubrug, Kembangkuning, Purwakarta Regency, West Java, Indonesia",
    Lat: -6.5531083,
    Long: 107.4101544,
    tipe: "sparing",
  },
  {
    id: "sparing03",
    nama: "PMT",
    alamat:
      "Jl. Nanjung No.Km. 2,2, Lagadar, Kec. Margaasih, Kabupaten Bandung, Jawa Barat 40216, Indonesia",
    Lat: -6.9226832,
    Long: 107.5413683,
    tipe: "sparing",
  },
  {
    id: "sparing04",
    nama: "Indorama PDL",
    alamat:
      "Jl. Batujajar Km 5.5 Komplek Giri Asih No 9, Samping, Giriasih, Batujajar, West Bandung Regency, West Java 40561, Indonesia",
    Lat: -6.8953855,
    Long: 107.4959834,
    tipe: "sparing",
  },
  {
    id: "sparing05",
    nama: "Besland",
    alamat:
      "Wisma Bukit Indah Block L Kawasan Kota Bukit Indah Cinangka Purwakarta, Dangdeur, Bungursari, Purwakarta Regency, West Java 41181, Indonesia",
    Lat: -6.4493131,
    Long: 107.4572677,
    tipe: "sparing",
  },
  {
    id: "sparing06",
    nama: "Indotaisei",
    alamat:
      "Kawasan Indotaisei. Blok K/4, Kalihurip, Cikampek, Karawang Regency, West Java 41373, Indonesia",
    Lat: -6.4244492,
    Long: 107.4187869,
    tipe: "sparing",
  },
  {
    id: "sparing07",
    nama: "Daliatex",
    alamat:
      "Jalan Mochammad Toha KM.7,3 No.307, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257",
    Lat: -6.9801221,
    Long: 107.6185288,
    tipe: "sparing",
  },
  {
    id: "sparing08",
    nama: "Papyrus",
    alamat:
      "Jl. Raya Banjaran Km. 16.2, Banjaran, Batukarut, Kec. Arjasari, Kabupaten Bandung, Jawa Barat 40379",
    Lat: -7.0384787,
    Long: 107.5906626,
    tipe: "sparing",
  },
  {
    id: "sparing09",
    nama: "BCP",
    alamat:
      "Jl. Leuwi Dulang No.24, Sukamaju, Kec. Majalaya, Kabupaten Bandung, Jawa Barat 40392",
    Lat: -7.0465691,
    Long: 107.7506977,
    tipe: "sparing",
  },
  {
    id: "sparing10",
    nama: "Pangjaya",
    alamat:
      "Jl. Mahar Martanegara No.175, Utama, Kec. Cimahi Sel., Kota Cimahi, Jawa Barat 40522",
    Lat: -6.5671703,
    Long: 106.5889997,
    tipe: "sparing",
  },
  {
    id: "sparing11",
    nama: "LPA",
    alamat:
      "Jl. Perjuangan, RT.03/RW.06, Sukadanau, Kec. Cikarang Bar., Kabupaten Bekasi, Jawa Barat 17520",
    Lat: -6.5791553,
    Long: 106.5895596,
    tipe: "sparing",
  },
  {
    id: "sparing12",
    nama: "Kertas PDL",
    alamat:
      "Jl. Cihaliwung No.181, Kertamulya, Kec. Padalarang, Kabupaten Bandung Barat, Jawa Barat 40553",
    Lat: -6.8387241,
    Long: 107.4084301,
    tipe: "sparing",
  },
  {
    id: "base01",
    nama: "Ambon",
    Lat: -3.6930873,
    Long: 128.1812567,
    tipe: "base",
  },
  {
    id: "base02",
    nama: "Gorontalo",
    Lat: 0.5514208,
    Long: 123.0573024,
    tipe: "base",
  },
  {
    id: "base03",
    nama: "Kendari",
    Lat: -3.97208394,
    Long: 122.51419888,
    tipe: "base",
  },
  {
    id: "base04",
    nama: "Mamuju",
    Lat: -2.67572686,
    Long: 118.89081881,
    tipe: "base",
  },
  {
    id: "base05",
    nama: "Manokwari",
    Lat: -0.8908335,
    Long: 134.0401184,
    tipe: "base",
  },
  {
    id: "base06",
    nama: "Oi",
    Lat: -3.2355792,
    Long: 104.6652638,
    tipe: "base",
  },
  {
    id: "base07",
    nama: "Oki",
    Lat: -3.4111286,
    Long: 104.8237439,
    tipe: "base",
  },
  {
    id: "base08",
    nama: "Palu",
    Lat: -0.88856113,
    Long: 119.86710194,
    tipe: "base",
  },
  {
    id: "base09",
    nama: "Pangkal Pinang",
    Lat: -2.14998011,
    Long: 106.11060219,
    tipe: "base",
  },
  {
    id: "base10",
    nama: "Samarinda",
    Lat: -0.4890044,
    Long: 117.1471739,
    tipe: "base",
  },
  {
    id: "base11",
    nama: "Serang",
    Lat: -6.12048382,
    Long: 106.1813008,
    tipe: "base",
  },
  {
    id: "base12",
    nama: "Ternate",
    Lat: 0.78725994,
    Long: 127.37470112,
    tipe: "base",
  },
];

const zoom = ref(5);
const center = ref<[number, number]>([-2.5, 118]);
const locations = ref<any[]>([]);

const fetchLocations = async () => {
  locations.value = data;
};

onMounted(fetchLocations);

// Custom Icon Merah
const sparingIcon = L.ExtraMarkers.icon({
  icon: "fa-number",
  markerColor: "blue",
  number: "S",
  shape: "star",
  prefix: "fa",
});

// Custom Icon Biru
const onlimoIcon = L.ExtraMarkers.icon({
  icon: "fa-number",
  markerColor: "orange",
  number: "O",
  shape: "circle",
  prefix: "fa",
});

const baseIcon = L.ExtraMarkers.icon({
  icon: "fa-number",
  markerColor: "violet",
  shape: "square",
  number: "B",
  prefix: "fa",
});
</script>

<template>
  <label class="input search-input">
    <svg
      class="h-[1em] opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2.5"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </g>
    </svg>
    <input type="search" class="grow" placeholder="Search site" />
  </label>

  <l-map
    :use-global-leaflet="false"
    :zoom="zoom"
    :center="center"
    style="height: 90vh; width: 100%"
  >
    <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <l-marker
      v-for="location in locations"
      :key="location.id"
      :lat-lng="[location.Lat, location.Long]"
      :icon="
        location.tipe === 'sparing'
          ? sparingIcon
          : location.tipe === 'base'
          ? baseIcon
          : onlimoIcon
      "
    >
      <l-popup>
        <p>
          <span class="font-bold text-lg">{{ location.nama }}</span
          ><br /><span class="italic text-md">{{
            location.alamat ? location.alamat : ""
          }}</span>
        </p>
        <p class="text-green-400">Active & Update</p>
      </l-popup>
    </l-marker>
    <!-- <l-marker-cluster-group> </l-marker-cluster-group> -->
  </l-map>

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
