import api from './api';
const controllerEndpoint = '/api/usuario';

export const iniciarSesion = async (usuario) => {
	try {
		const res = await api.post(controllerEndpoint + '/login', usuario);
		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};

export const obtenerUsuarios = async (params) => {
	try {
		const res = await api.get(`${controllerEndpoint}`, { params });
		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};
