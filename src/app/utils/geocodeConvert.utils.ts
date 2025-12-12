import axios from "axios";
import env from "../config/env";
import { ICoord } from "../modules/users/user.interface";


export const addressToLongLat = async (address: string): Promise<ICoord> => {
 const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const response = await axios.get(url, {
    headers: {
    'User-Agent': `LinkUp/1.0 (${env.ADMIN_GMAIL})`,
    'Referer': `${env.BACKEND_URL}`  
    }
  });

  return {
    lat: response.data[0]?.lat,
    long: response.data[0]?.lon
  };
}