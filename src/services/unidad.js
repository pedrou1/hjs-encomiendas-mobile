import api from './api';
const controllerEndpoint = '/api/unidadtransporte';

export const otenerUnidadDeChofer = async (idChofer) => {
	try {
		const res = await api.get(`${controllerEndpoint}/chofer/${idChofer}`);
		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};
