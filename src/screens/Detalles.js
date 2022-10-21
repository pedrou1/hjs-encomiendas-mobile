import React, { useContext, useState, useRef, useMemo, useEffect } from 'react';
import { FlatList, TouchableHighlight, View } from 'react-native';
import { Layout, TopNav, themeColor, Button } from 'react-native-rapi-ui';
import { Card, Title, Paragraph, Chip, Text, FAB, ActivityIndicator } from 'react-native-paper';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Constantes from '../utils/Constantes';
import { AuthContext } from '../provider/AuthProvider';
import * as pedidosService from '../services/pedidos';
import { estados } from './../utils/Constantes';
import AnotarEntregados from './AnotarEntregados';

export default function (props) {
	const [pedidos, setPedidos] = useState([]);
	const [loading, setLoading] = useState(false);
	const { user, setUser } = useContext(AuthContext);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const navigation = props.navigation;

	const myIcon = <AntDesign name="upcircleo" size={32} color="red" />;

	useEffect(() => {
		getPedidos();
	}, []);

	useEffect(() => {
		console.log('useEffect');
	}, [props]);

	const getPedidos = async () => {
		// const res = await pedidosService.otenerPedidosChoferPosteriores(user.idUsuario);
		setLoading(true);
		const res = await pedidosService.obtenerPedidosDiaEstadoChofer({ idUsuarioChofer: user.idUsuario });
		if (res && res.operationResult == Constantes.SUCCESS) {
			setPedidos(res.pedidos);
		}

		setLoading(false);
	};

	const onRefresh = async () => {
		setIsRefreshing(true);
		setLoading(true);
		const res = await pedidosService.obtenerPedidosDiaEstadoChofer({ idUsuarioChofer: user.idUsuario });
		if (res && res.operationResult == Constantes.SUCCESS) {
			setPedidos(res.pedidos);
		}

		setLoading(false);
		setIsRefreshing(false);
	};

	const selectPedido = async (pedido) => {
		// seleccionar cliente y redireccionar
		// navigation.navigate('CrearPedido', {
		// 	clienteSeleccionado: { idCliente: cliente.idUsuario, nombre: cliente.nombre + ' ' + cliente.apellido },
		// });
	};

	return (
		<Layout>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10, marginRight: 10, paddingVertical: 5 }}>
				<View style={{ width: '50%' }}>
					<Chip
						mode="outlined"
						style={{ marginTop: 10, padding: 5 }}
						textStyle={{ marginLeft: 40 }}
						onPress={() => {
							// navigation.navigate('PantallaTest');
						}}
					>
						Pedidos de hoy
					</Chip>
				</View>
				<View style={{ width: '45%' }}>
					<Chip
						mode="outlined"
						style={{ marginTop: 10, padding: 5 }}
						textStyle={{ marginLeft: 35 }}
						onPress={() => {
							// navigation.navigate('PantallaTest');
						}}
					>
						Ultimos pedidos
					</Chip>
				</View>
			</View>
			<View style={{ minHeight: 470 }}>
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
							onRefresh={() => onRefresh()}
							refreshing={isRefreshing}
							keyExtractor={(item, i) => `${item.idPedido}`}
							renderItem={({ item, i }) => (
								<TouchableHighlight
									onPress={() => {
										// selectClientePedido(item);
										if (item.idPedido == 20) navigation.navigate('Inicio', { pedidoCancelado: item });
									}}
								>
									<View>
										<Card>
											<Card.Content>
												<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
													<View style={{ borderRightWidth: 1, borderRightColor: '#d3d3d3', width: '80%' }}>
														<Title>{`${item.tipoPedido.nombre} $${item.tipoPedido.tarifa}`}</Title>
														<Paragraph>{`${item.cliente.nombre} ${item.cliente.apellido}`}</Paragraph>
														<Paragraph>
															{item.nombreDireccion.substring(0, 40) + `${item.nombreDireccion.length > 55 ? '...' : ''}`}
														</Paragraph>
													</View>
													<View style={{ alignSelf: 'center', marginLeft: 5 }}>
														<Text variant="titleMedium">
															{item.estado && item.estado != 0 ? estados.find((e) => e.value === item.estado)?.label : ''}
														</Text>
													</View>
												</View>
											</Card.Content>
										</Card>
									</View>
								</TouchableHighlight>
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
			{!loading && pedidos?.length ? (
				<FAB
					label="Anotar entregados"
					icon="checkbox-marked-circle-outline"
					contentStyle={{ flexDirection: 'row-reverse' }}
					style={{ marginLeft: 100, marginRight: 100, marginBottom: 10, backgroundColor: '#485778' }}
					color="white"
					customSize={45}
					onPress={async () => {
						// await reloadRoute();
						navigation.navigate('AnotarEntregados');
					}}
				/>
			) : (
				<></>
			)}
		</Layout>
	);
}
