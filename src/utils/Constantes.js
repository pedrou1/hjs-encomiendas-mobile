export const ERROR = 0;
export const SUCCESS = 1;
export const ALREADYEXIST = 2;
export const INVALIDUSER = 3;

export const USUARIO = 'usuario';

export const PERMISO_ADMINISTRADOR = 1;
export const PERMISO_CHOFER = 2;

export const ID_CLIENTE = 1;
export const ID_CHOFER = 2;
export const ID_ADMINISTRADOR = 3;

export const ESTADO_PEDIDO_PENDIENTE = 1;
export const ESTADO_PEDIDO_RETIRADO = 2; // retirado
export const ESTADO_PEDIDO_ENTREGADO = 3; //entregado
export const ESTADO_PEDIDO_CANCELADO = 4; // cancelado

export const estados = [
	{ label: 'Pendiente', value: 1 },
	{ label: 'Retirado', value: 2 },
	{ label: 'Entregado', value: 3 },
	{ label: 'Cancelado', value: 4 },
];
