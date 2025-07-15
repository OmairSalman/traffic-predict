import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://traffico.cloudomair.org/api',
  timeout: 10000,
});