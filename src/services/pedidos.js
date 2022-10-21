import api from './api';
const controllerEndpoint = '/api/pedido';
const GOOGLE_API_KEY = process.env.PLACES_API_BASE.toString();

export const registrarPedido = async (pedido) => {
	try {
		const res = await api.post(controllerEndpoint + '/crear', pedido);

		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};

export const obtenerPedidosPendientesChoferPorDia = async (params) => {
	try {
		const res = await api.get(`${controllerEndpoint}/chofer`, { params });
		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};
const createStringWaypoints = (waypoints) => {
	let stringWaypoints = '';
	waypoints.forEach((waypoint) => {
		stringWaypoints += `${waypoint.latitude},${waypoint.longitude}|`;
	});
	return stringWaypoints;
};

export const optimizarRuta = async (origin, waypoints, destination) => {
	const wp = waypoints ? createStringWaypoints(waypoints) : null;
	try {
		const res = await api.get(`https://maps.googleapis.com/maps/api/directions/json?
		origin=${origin.latitude},${origin.longitude}
		&destination=${destination.latitude},${destination.longitude}
		${wp ? `&waypoints=optimize:true|${wp}` : ''}
		&key=${GOOGLE_API_KEY}
		&modes=driving&language=en`);
		if (res.status == 200) {
			return res.data.routes[0].waypoint_order;
		}
	} catch (err) {}
};

export const obtenerPedidosDiaEstadoChofer = async (params) => {
	try {
		const res = await api.get(`${controllerEndpoint}/chofer/dia/estado`, { params });
		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};

export const otenerPedidosChoferRetirados = async (idChofer) => {
	try {
		const res = await api.get(`${controllerEndpoint}/retirados/${idChofer}`);
		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};

export const otenerPedidosChoferPosteriores = async (idChofer) => {
	try {
		const res = await api.get(`${controllerEndpoint}/posterior/${idChofer}`);
		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};

export const modificarEstadoPedido = async (idPedido, estado) => {
	try {
		const res = await api.put(controllerEndpoint + `/modificar/estado/${idPedido}/${estado}`);

		if (res.status == 200) {
			return res.data;
		}
	} catch (err) {}
};
