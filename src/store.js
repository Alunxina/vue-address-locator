import { createStore } from 'vuex';


const store = createStore({
  state: {
    provinces: [],
    // municipalities: {}, // Update to store the entire childOptions object
  },
  mutations: {
    setProvinces(state, provinces) {
      state.provinces = provinces;
    },
    // setMunicipalities(state, municipalities) {
    //   state.municipalities = municipalities; // Update to store the entire childOptions object
    // },
  },
});

export default store;
