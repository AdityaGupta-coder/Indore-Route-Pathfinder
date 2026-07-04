import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // Adjust if your backend is deployed or on another port
  headers: {
    'Content-Type': 'application/json'
  }
});



export default API;
