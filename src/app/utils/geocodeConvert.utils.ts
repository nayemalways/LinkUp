import axios from "axios";
import { ICoord } from "../modules/users/user.interface";


export const addressToLongLat = async (address: string): Promise<ICoord> => {
  const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(address.trim())}&limit=1`;
  const response = await axios.get(photonUrl);
  const coordinates = response.data.features[0].geometry.coordinates; // Convention: [long, lat]

  return {
    long: coordinates[0],
    lat: coordinates[1]
  };
}