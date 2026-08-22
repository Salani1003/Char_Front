import axios from "axios";

const charApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// TODO : intecerceptores

export {charApi};
