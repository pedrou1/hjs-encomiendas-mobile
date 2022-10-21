import React, { useContext, useState, useRef, useMemo, useEffect } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { Layout, TopNav, themeColor, Button } from 'react-native-rapi-ui';
import { Card, Title, Paragraph, Chip, Text, FAB, ActivityIndicator } from 'react-native-paper';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Constantes from '../utils/Constantes';
import { AuthContext } from '../provider/AuthProvider';
import * as pedidosService from '../services/pedidos';
import { estados } from './../utils/Constantes';

export default function ({ navigation }) {
	const [pedidos, setPedidos] = useState([]);
	const [loading, setLoading] = useState(false);
	const { user, setUser } = useContext(AuthContext);

	const myIcon = <AntDesign name="upcircleo" size={32} color="red" />;

	useEffect(() => {
		getPedidos();
	}, []);

	const getPedidos = async () => {
		setLoading(true);
		const res = await pedidosService.otenerPedidosChoferRetirados(user.idUsuario);
		if (res && res.operationResult == Constantes.SUCCESS) {
			setPedidos(res.pedidos);
		}

		setLoading(false);
	};

	const actualizarEstadoPedido = async (pedido, estado) => {
		switch (estado) {
			case Constantes.ESTADO_PEDIDO_ENTREGADO:
				pedido.estado == Constantes.ESTADO_PEDIDO_ENTREGADO;
				const res = await pedidosService.modificarEstadoPedido(pedido.idPedido, Constantes.ESTADO_PEDIDO_ENTREGADO);
				getPedidos();
				break;
			case Constantes.ESTADO_PEDIDO_CANCELADO:
				pedido.estado == Constantes.ESTADO_PEDIDO_CANCELADO;
				const resp = await pedidosService.modificarEstadoPedido(pedido.idPedido, Constantes.ESTADO_PEDIDO_CANCELADO);
				getPedidos();
				//cancelado
				break;
			default:
				break;
		}
	};

	return (
		<Layout>
			<TopNav
				middleContent="Anotar entregados"
				leftContent={<Ionicons name="chevron-back" size={20} color={themeColor.black} />}
				leftAction={() => navigation.goBack()}
			/>
			<View style={{ minHeight: 460 }}>
				{!loading ? (
					pedidos?.length ? (
						<FlatList
							onEndReached={async () => {
								const res = await pedidosService.otenerPedidosChoferPosteriores(user.idUsuario);
								if (res && res.operationResult == Constantes.SUCCESS && res.usuarios.length > 0) {
									setPedidos([...pedidos, ...res.pedidos]);
								}
							}}
							contentContainerStyle={{ paddingBottom: 62 }}
							onEndReachedThreshold={0.5}
							data={pedidos}
							keyExtractor={(item, i) => `${item.idPedido}`}
							renderItem={({ item, i }) => (
								<View>
									<Card>
										<Card.Content>
											<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
												<View style={{ borderRightWidth: 1, borderRightColor: '#d3d3d3', width: '60%' }}>
													<Text variant="titleLarge">{`${item.cliente.nombre} ${item.cliente.apellido}`}</Text>
													<Title>{`${item.tipoPedido.nombre} $${item.tipoPedido.tarifa}`}</Title>
													<Paragraph>
														{item.nombreDireccion.substring(0, 65) + `${item.nombreDireccion.length > 65 ? '...' : ''}`}
													</Paragraph>
													{item.apartamento && <Paragraph>{item.apartamento}</Paragraph>}
												</View>
												<TouchableOpacity
													style={{
														width: '15%',
														color: 'white',
														display: 'flex',
														flexDirection: 'row',
														justifyContent: 'center',
														alignItems: 'center',
													}}
													onPress={() => {
														actualizarEstadoPedido(item, Constantes.ESTADO_PEDIDO_CANCELADO);
													}}
												>
													{/* <Text style={{ alignSelf: 'flex-end' }}>Cancelar</Text> */}
													<AntDesign name="closecircleo" size={45} color="#940000" />
												</TouchableOpacity>
												<TouchableOpacity
													style={{
														width: '15%',
														color: 'white',
														display: 'flex',
														flexDirection: 'row',
														justifyContent: 'center',
														alignItems: 'center',
													}}
													onPress={() => {
														actualizarEstadoPedido(item, Constantes.ESTADO_PEDIDO_ENTREGADO);
													}}
												>
													{/* <Chip icon="check" onPress={() => console.log('Pressed')}></Chip> */}
													<AntDesign name="checkcircleo" size={45} color={'#005e05'} />
													{/* <Text style={{ alignSelf: 'flex-end', color: 'white' }}>Completado</Text> */}
												</TouchableOpacity>
											</View>
										</Card.Content>
									</Card>
								</View>
							)}
						/>
					) : (
						<View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
							<Title>No hay pedidos</Title>
						</View>
					)
				) : (
					<View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
						<ActivityIndicator size="large" color="#0000ff" />
					</View>
				)}
			</View>
		</Layout>
	);
}
