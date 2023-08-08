<template>
      <div class="box">
        <!-- Province loading indicator -->
        <div v-if="loadingProvinces" class="loading-indicator">
          Loading provinces...
        </div>
        <div class="column has-text-left is-size-5">
          <label for="province">Province: </label>
          <select
            v-model="province"
            id="province"
            class="input"
            :disabled="loadingProvinces"
          >
            <option disabled value="">Select a province</option>
            <option v-for="prov in provinces" :value="prov" :key="prov">
              {{ prov }}
            </option>
          </select>
        </div>
      </div>
      <div class="box">
        <!-- Municipality loading indicator -->
        <div v-if="loadingMunicipalities" class="loading-indicator">
          Loading municipalities...
        </div>
        <div class="column has-text-left is-size-5">
          <label for="municipality">Municipality: </label>
          <select
            v-model="municipality"
            id="municipality"
            class="input"
            :disabled="isMunicipalityDisabled || loadingMunicipalities"
          >
            <option disabled value="">Select a municipality</option>
            <option v-for="muni in municipalities" :value="muni" :key="muni">
              {{ muni }}
            </option>
          </select>
        </div>
      </div>
      <div class="box">
        <!-- Barangay loading indicator -->
        <div v-if="loadingBarangays" class="loading-indicator">
          Loading barangays...
        </div>
        <div class="column has-text-left is-size-5">
          <label for="barangay">Barangay: </label>
          <select
            v-model="barangay"
            id="barangay"
            class="input"
            :disabled="isBarangayDisabled"
          >
            <option disabled value="">Select a barangay</option>
            <option v-for="bgy in barangays" :value="bgy" :key="bgy">
              {{ bgy }}
            </option>
          </select>
        </div>
      </div>
      <div class="box">
        <div class="column has-text-left is-size-5">
          <label for="address">Address: </label>
          <input
            v-model="searchText"
            id="address"
            class="input"
            :disabled="loadingBarangays"
            list="suggestions-list"
            @input="getSuggestions"
            @change="onAddressSelected"
          />
          <datalist id="suggestions-list">
            <option
              v-for="suggestion in suggestions"
              :key="suggestion.address"
              :value="suggestion.address"
            ></option>
          </datalist>
        </div>
      </div>
      <div class="box is-large">
        <!-- Iframe loading indicator -->
        <div v-if="loadingBarangays" class="loading-indicator is-loading">
          Loading map...
        </div>
        <iframe
          v-if="!loadingBarangays && iframeSrc"
          :src="iframeSrc"
          width="auto"
          height="auto"
          style="border: 0"
          loading="lazy"
        ></iframe>
        <iframe
          v-else
          width="auto"
          height="auto"
          style="border: 0"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDBZIXSclXCvGim_n17QvvjVhyxlutoqKA&q=Space+Needle,Seattle+WA"
        ></iframe>
      </div>
</template>

<script setup>
import { ref, computed, watchEffect, watch } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

const barangaysCache = {};
const suggestionsCache = {};
const store = useStore();

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

const suggestionsUrl = 'http://localhost:3000/autocomplete';
const googlePlacesUrl =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';

let options = ref([]);
let province = ref('');
let municipality = ref('');
let barangays = ref([]);
let barangay = ref('');
let searchText = ref('');
let suggestions = ref([]);
let error = ref(false);
let loadingProvinces = ref(true);
let loadingMunicipalities = ref(false);
let loadingBarangays = ref(false);
let barangayDisabled = ref(true);
const iframeSrc = ref('');
let selectedplaceId = ref('');

const optionsUrl =
  'https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusters/myruntimeWeb';

axios
  .get(optionsUrl)
  .then(response => {
    options.value = response.data.data; // Update the options with the fetched data
    store.commit('setProvinces', response.data.data['parentOptions']);
    // store.commit('setMunicipalities', response.data.data['childOptions']);
    loadingProvinces.value = false;
  })
  .catch(error => {
    console.error('Error fetching options:', error);
    loadingProvinces.value = false;
  });

const provinces = computed(() => {
  return store.state.provinces.length > 0
    ? store.state.provinces
    : ['No provinces found'];
});

const municipalities = computed(() => {
  return province.value
    ? [...options.value['childOptions'][province.value]].sort()
    : ['No municipalities found'];
});

const isMunicipalityDisabled = computed(() => {
  return !province.value || loadingMunicipalities.value;
});

const getBarangays = () => {
  if (!province.value || !municipality.value) return;

  loadingBarangays.value = true;
  const cacheKey = `${province.value}-${municipality.value}`;

  if (barangaysCache[cacheKey]) {
    // If data is already available in cache
    barangays.value = barangaysCache[cacheKey];
    error.value = false;
    loadingBarangays.value = false;
  } else {
    const url = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusterOptions/myruntimeWeb?parentOption=${encodeURIComponent(
      province.value
    )}&childOption=${encodeURIComponent(municipality.value)}`;

    api
      .get(url)
      .then(response => {
        barangays.value = response.data.data;
        error.value = false;
        loadingBarangays.value = false;

        // Store the response in cache
        barangaysCache[cacheKey] = response.data.data;
      })
      .catch(error => {
        console.error('Error fetching barangays:', error);
        barangays.value = [];
        error.value = true;
        loadingBarangays.value = false;
      });
  }
};
const isBarangayDisabled = computed(() => {
  return !province.value || !municipality.value || loadingBarangays.value;
});

watchEffect(() => {
  getBarangays();
});

const getSuggestions = () => {
  if (!barangay.value || searchText.value.trim() === '') {
    suggestions.value = [];
    return;
  }

  const cacheKey = `${province.value}-${municipality.value}-${barangay.value}-${searchText.value}`;

  if (suggestionsCache[cacheKey]) {
    // If data is already available in cache
    suggestions.value = suggestionsCache[cacheKey];
  } else {
    const url = `${suggestionsUrl}?suggestions&province=${encodeURIComponent(
      province.value
    )}&municipality=${encodeURIComponent(
      municipality.value
    )}&barangay=${encodeURIComponent(
      barangay.value
    )}&searchText=${encodeURIComponent(searchText.value)}`;

    api
      .get(url)
      .then(response => {
        suggestions.value = response.data.responseArray;

        // Store the response in cache
        suggestionsCache[cacheKey] = response.data.responseArray;
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error);
        suggestions.value = [];
      });
  }
};

const onAddressSelected = () => {
  if (!searchText.value.trim()) {
    selectedplaceId.value = '';
    iframeSrc.value = '';
    return;
  }

  const url = `${googlePlacesUrl}?input=${encodeURIComponent(
    searchText.value
  )}&key=AIzaSyDBZIXSclXCvGim_n17QvvjVhyxlutoqKA`;

  api
    .get(url)
    .then(response => {
      if (response.data.predictions.length > 0) {
        const placeId = response.data.predictions[0].place_id;
        selectedplaceId.value = placeId;
        iframeSrc.value = getMapUrl(placeId); // Update the iframe src with the new map URL
      } else {
        selectedplaceId.value = '';
        iframeSrc.value = ''; // Set the iframe src to empty string if no place ID found
      }
    })
    .catch(error => {
      console.error('Error fetching place ID:', error);
      selectedplaceId.value = '';
      iframeSrc.value = ''; // Set the iframe src to empty string if an error occurs
    });
};

const getMapUrl = placeId => {
  return `https://www.google.com/maps/embed/v1/place?key=AIzaSyDBZIXSclXCvGim_n17QvvjVhyxlutoqKA&q=place_id:${encodeURIComponent(
    placeId
  )}`;
};

import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

watchEffect(() => {
  const { params } = route;
  if (params.province) {
    province.value = params.province;
  } else {
    province.value = '';
  }

  if (params.municipality) {
    municipality.value = params.municipality;
  } else {
    municipality.value = '';
  }
});

watch([province, municipality], ([newProvince, newMunicipality]) => {
  const path = `/${newProvince}/${newMunicipality}`;
  router.push(path);
});
</script>

