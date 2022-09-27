import api from './api';
const controllerEndpoint = '/api/tipospedido';

export const obtenerTiposPedidos = async (params) => {
	try {
		const res = await api.get(controllerEndpoint, { params });
		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};
