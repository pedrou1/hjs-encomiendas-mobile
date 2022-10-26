import React, { useEffect, useState } from 'react';
import { FlatList, TouchableHighlight, View } from 'react-native';
import { Layout, TopNav, themeColor } from 'react-native-rapi-ui';
import { Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import * as servicioUsuarios from '../services/usuarios';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Constantes from '../utils/Constantes';

const myIcon = <AntDesign name="right" size={32} color="green" />;

const SeleccionarClientes = ({ navigation }) => {
	const [clientes, setClientes] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		getClientes();
	}, []);

	const getClientes = async () => {
		setLoading(true);
		const paginationData = { PageIndex: clientes.length, PageSize: 10 };
		paginationData.Tipo = Constantes.ID_CLIENTE;
		const res = await servicioUsuarios.obtenerUsuarios(paginationData);
		if (res && res.operationResult == Constantes.SUCCESS) {
			setClientes(res.usuarios);
		}
		setLoading(false);
	};

	const selectClientePedido = async (cliente) => {
		// seleccionar cliente y redireccionar
		navigation.navigate('CrearPedido', {
			clienteSeleccionado: { idCliente: cliente.idUsuario, nombre: `${cliente.nombre} ${cliente.apellido ? cliente.apellido : ''}` },
		});
	};
	return (
		<Layout>
			<TopNav
				middleContent="Clientes"
				leftContent={<Ionicons name="chevron-back" size={20} color={themeColor.black} />}
				leftAction={() => navigation.goBack()}
			/>
			<View>
				{!loading ? (
					<FlatList
						onEndReached={async () => {
							const paginationData = { PageIndex: clientes.length, PageSize: 10 };
							paginationData.Tipo = Constantes.ID_CLIENTE;
							const res = await servicioUsuarios.obtenerUsuarios(paginationData);
							if (res && res.operationResult == Constantes.SUCCESS && res.usuarios.length > 0) {
								setClientes([...clientes, ...res.usuarios]);
							}
						}}
						contentContainerStyle={{ paddingBottom: 62 }}
						onEndReachedThreshold={0.5}
						data={clientes}
						keyExtractor={(item, i) => `${item.idUsuario}`}
						renderItem={({ item }) => (
							<TouchableHighlight
								onPress={() => {
									selectClientePedido(item);
								}}
							>
								<View>
									<Card>
										<Card.Content>
											<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
												<View>
													<Title>{`${item.nombre} ${item.apellido ? item.apellido : ''}`}</Title>
													<Paragraph>{item.ci ? item.ci : item.rut}</Paragraph>
													<Paragraph>{item.direccion ? item.direccion : item.telefono ? item.telefono : ''}</Paragraph>
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

export default SeleccionarClientes;
