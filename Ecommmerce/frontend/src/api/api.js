import axios from 'axios'
const BASE_URL = `http://localhost:8080`;
const PRODUCTS_URL = `${BASE_URL}/api/v1/products`;

export const productApi = {
    getAllProducts:()=>{return axios.get(PRODUCTS_URL);}
}