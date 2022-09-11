import axios from 'axios';
import Config from 'react-native-config';

// FIXME falta configurar el .env
const api = axios.create({
	baseURL: process.env.API_BASE,
	headers: {
		'Content-Type': 'application/json',
	},
});

export default api;
