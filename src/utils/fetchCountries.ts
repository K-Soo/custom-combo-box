import { Options } from "../types";
import countries from "../constants/countries.json";

export const fetchCountries = async (): Promise<Options> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(countries);
    }, 500);
  });
};
