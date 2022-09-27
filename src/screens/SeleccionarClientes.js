import React, { useEffect, useState } from 'react';
import { FlatList, TouchableHighlight, View } from 'react-native';
import { Layout, TopNav, themeColor } from 'react-native-rapi-ui';
import { Card, Title, Paragraph } from 'react-native-paper';
import * as servicioUsuarios from '../services/usuarios';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Constantes from '../utils/Constantes';

const myIcon = <AntDesign name="right" size={32} color="green" />;

const SeleccionarClientes = ({ navigation }) => {
	const [clientes, setClientes] = useState([]);

	useEffect(() => {
		getClientes();
	}, []);

	const getClientes = async () => {
		const paginationData = { PageIndex: clientes.length, PageSize: 10 };
		const res = await servicioUsuarios.obtenerUsuarios(paginationData);
		if (res && res.operationResult == Constantes.SUCCESS) {
			setClientes(res.usuarios);
		}
	};

	const selectClientePedido = async (cliente) => {
		// seleccionar cliente y redireccionar
		navigation.navigate('CrearPedido', {
			clienteSeleccionado: { idCliente: cliente.idUsuario, nombre: cliente.nombre + ' ' + cliente.apellido },
		});
	};
	return (
		<Layout>
			<TopNav
				middleContent="Pantalla test"
				leftContent={<Ionicons name="chevron-back" size={20} color={themeColor.black} />}
				leftAction={() => navigation.goBack()}
			/>
			<View>
				<FlatList
					onEndReached={async () => {
						// obtiene de a 10 usuarios
						const paginationData = { PageIndex: clientes.length, PageSize: 10 };
						const res = await servicioUsuarios.obtenerUsuarios(paginationData); //FIXME TRAER SOLO CATEGORIA CLIENTES
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
												<Title>{`${item.nombre} ${item.apellido}`}</Title>
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
			</View>
		</Layout>
	);
};

export default SeleccionarClientes;
