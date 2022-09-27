import api from './api';
const controllerEndpoint = '/api/pedido';

export const registrarPedido = async (pedido) => {
	try {
		const res = await api.post(controllerEndpoint + '/crear', pedido);
		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};