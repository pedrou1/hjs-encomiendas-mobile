import React, { useEffect, useState } from 'react';
import { FlatList, TouchableHighlight, View } from 'react-native';
import { Layout, TopNav, themeColor, Text } from 'react-native-rapi-ui';
import { Card, Title, ActivityIndicator } from 'react-native-paper';
import * as servicioTipoPedidos from '../services/tiposPedidos';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Constantes from '../utils/Constantes';

const myIcon = <AntDesign name="right" size={32} color="green" />;

const SeleccionarTipoPedido = ({ navigation }) => {
	const [tiposPedidos, setTiposPedidos] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		getTiposPedidos();
	}, []);

	const getTiposPedidos = async () => {
		setLoading(true);
		const paginationData = { PageIndex: tiposPedidos.length, PageSize: 10 };
		const res = await servicioTipoPedidos.obtenerTiposPedidos(paginationData);

		if (res && res.operationResult == Constantes.SUCCESS) {
			setTiposPedidos(res.tiposPedidos);
		}
		setLoading(false);
	};

	const selectTiposPedidos = async (tipo) => {
		// seleccionar tipo y redireccionar
		navigation.navigate('CrearPedido', {
			tipoPedidoSeleccionado: {
				idTipoPedido: tipo.idTipoPedido,
				nombre: tipo.nombre,
				tarifa: tipo.tarifa,
				pesoDesde: tipo.pesoDesde,
				pesoHasta: tipo.pesoHasta,
			},
		});
	};
	return (
		<Layout>
			<TopNav
				middleContent="Seleccionar tipo de pedido"
				leftContent={<Ionicons name="chevron-back" size={20} color={themeColor.black} />}
				leftAction={() => navigation.goBack()}
			/>
			<View>
				{!loading ? (
					<FlatList
						onEndReached={async () => {
							// obtiene de a 10 usuarios
							const paginationData = { PageIndex: tiposPedidos.length, PageSize: 10 };
							const res = await servicioTipoPedidos.obtenerTiposPedidos(paginationData);

							if (res && res.operationResult == Constantes.SUCCESS) {
								setTiposPedidos([...tiposPedidos, ...res.tiposPedidos]);
							}
						}}
						contentContainerStyle={{ paddingBottom: 62 }}
						onEndReachedThreshold={0.5}
						data={tiposPedidos}
						keyExtractor={(item, i) => `${item.idTipoPedido}`}
						renderItem={({ item }) => (
							<TouchableHighlight
								onPress={() => {
									selectTiposPedidos(item);
								}}
							>
								<View>
									<Card>
										<Card.Content>
											<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
												<View>
													<Title>{item.nombre}</Title>
												</View>
												<View>
													<Text style={{ color: 'grey', fontSize: 16 }}>
														De {item.pesoDesde}KM a {item.pesoHasta}KM
													</Text>
													<Text style={{ color: 'grey' }}>${item.tarifa}</Text>
												</View>
												<View style={{ alignSelf: 'center' }}>{myIcon}</View>
											</View>
										</Card.Content>
									</Card>
								</View>
							</TouchableHighlight>
						)}
					/>
				) : (
					<View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
						<ActivityIndicator size="large" color="#0000ff" />
					</View>
				)}
			</View>
		</Layout>
	);
};

export default SeleccionarTipoPedido;
