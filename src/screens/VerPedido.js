import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Layout, Text, TextInput, Button, themeColor, TopNav } from 'react-native-rapi-ui';
import { AuthContext } from '../provider/AuthProvider';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Chip, Text as TextPaper } from 'react-native-paper';
import * as pedidos from '../services/pedidos';
import * as Constantes from '../utils/Constantes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ({ route, navigation }) {
	const { user, setUser } = useContext(AuthContext);
	const [tipoPedido, setTipoPedido] = useState({});
	const [estado, setEstado] = useState(estados[0]);
	const [pedido, setPedido] = useState(null);

	const params = route.params;

	// //({ route, navigation })
	// //const { usuario, unidad } = route.params;

	useEffect(() => {
		//setChofer(params.chofer);
		if (params?.pedido) {
			setPedido(params.pedido);
			setTipoPedido(params?.pedido.tipoPedido);
		}
	}, [params]);

	return (
		<KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
			<Layout>
				<TopNav
					middleContent="Ver pedido"
					leftContent={<Ionicons name="chevron-back" size={20} color={themeColor.black} />}
					leftAction={() => navigation.goBack()}
				/>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
					}}
				>
					<>
						{pedido && (
							<View
								style={{
									flex: 3,
									paddingTop: 20,
									paddingHorizontal: 20,
									paddingBottom: 20,
									backgroundColor: themeColor.white,
								}}
							>
								{}
								<Text>Direccion</Text>
								<View
									style={{
										flexDirection: 'row',
										backgroundColor: '#f6f6f6',
										borderRadius: 15,
										minHeight: 50,
										padding: 10,
										marginTop: 2,
									}}
								>
									<Text variant="headlineMedium">{pedido.nombreDireccion}</Text>
								</View>
								<Text style={{ marginTop: 15 }}>Cliente</Text>
								<View
									style={{
										flexDirection: 'row',
										backgroundColor: '#f6f6f6',
										borderRadius: 10,
										minHeight: 50,
										padding: 10,
										marginTop: 2,
										alignItems: 'center',
									}}
								>
									<Text variant="headlineMedium">{`${pedido.cliente.nombre} ${pedido.cliente.apellido ? pedido.cliente.apellido : ''}`}</Text>
								</View>
								{/* <Text>Tipo</Text>
								<TouchableOpacity
									onPress={() => {
										navigation.navigate('TiposPedidos');
									}}
								>
									<Chip
										style={{ padding: 10, marginTop: 2, backgroundColor: '#c9daff' }}
										icon={() => <Icon name={tipoPedido?.nombre ? 'check-bold' : 'information'} size={17} color="black" />}
									>
										<TextPaper variant="titleMedium">{tipoPedido.nombre}</TextPaper>
									</Chip>
								</TouchableOpacity> */}

								<Text style={{ marginTop: 15 }}>Tipo</Text>
								<View
									style={{
										flexDirection: 'row',
										backgroundColor: '#f6f6f6',
										borderRadius: 10,
										minHeight: 50,
										padding: 10,
										marginTop: 2,
										alignItems: 'center',
									}}
								>
									<Text variant="headlineMedium">{tipoPedido.nombre}</Text>
								</View>
								{tipoPedido.pesoDesde && (
									<>
										<Text style={{ marginTop: 5 }}>
											<Text size="sm">{'Tarifa: '}</Text>
											<Text
												style={{
													backgroundColor: '#f6f6f6',
													borderRadius: 15,
													padding: 5,
													alignItems: 'center',
													width: '50%',
												}}
												size="sm"
											>
												{'$ ' + tipoPedido.tarifa}
											</Text>
										</Text>
										<Text>
											<Text size="sm">{'Peso desde: '}</Text>
											<Text
												style={{
													backgroundColor: '#f6f6f6',
													borderRadius: 10,
													padding: 5,
													alignItems: 'center',
													width: '50%',
												}}
												size="sm"
											>
												{tipoPedido.pesoDesde + ' km'}
											</Text>

											<Text size="sm">{'  Peso hasta: '}</Text>
											<Text
												style={{
													backgroundColor: '#f6f6f6',
													borderRadius: 10,
													padding: 5,
													alignItems: 'center',
													width: '50%',
												}}
												size="sm"
											>
												{tipoPedido.pesoHasta + ' km'}
											</Text>
										</Text>
									</>
								)}

								{pedido.descripcion && (
									<>
										<Text style={{ marginTop: 15 }}>Descripcion</Text>
										<View
											style={{
												flexDirection: 'row',
												backgroundColor: '#f6f6f6',
												borderRadius: 10,
												minHeight: 50,
												padding: 10,
												marginTop: 2,
												alignItems: 'center',
											}}
										>
											<Text variant="headlineMedium">{pedido.descripcion}</Text>
										</View>
									</>
								)}

								{pedido.apartamento && (
									<>
										<Text style={{ marginTop: 15 }}>Apartamento</Text>
										<View
											style={{
												flexDirection: 'row',
												backgroundColor: '#f6f6f6',
												borderRadius: 10,
												minHeight: 50,
												padding: 10,
												marginTop: 2,
												alignItems: 'center',
											}}
										>
											<Text variant="headlineMedium">{pedido.apartamento}</Text>
										</View>
									</>
								)}

								{pedido.nroPuerta && (
									<>
										<Text style={{ marginTop: 15 }}>Nro. Puerta</Text>
										<View
											style={{
												flexDirection: 'row',
												backgroundColor: '#f6f6f6',
												borderRadius: 10,
												minHeight: 50,
												padding: 10,
												marginTop: 2,
												alignItems: 'center',
											}}
										>
											<Text variant="headlineMedium">{pedido.nroPuerta}</Text>
										</View>
									</>
								)}

								{pedido.cliente?.telefono && (
									<>
										<Text style={{ marginTop: 15 }}>Telefono</Text>
										<View
											style={{
												flexDirection: 'row',
												backgroundColor: '#f6f6f6',
												borderRadius: 10,
												minHeight: 50,
												padding: 10,
												marginTop: 2,
												alignItems: 'center',
												justifyContent: 'space-between',
											}}
										>
											<Text variant="headlineMedium">{pedido.cliente?.telefono}</Text>
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
													Linking.openURL(`tel:${pedido.cliente?.telefono}`);
												}}
											>
												<MaterialCommunityIcons name="cellphone" size={40} color="black" />
											</TouchableOpacity>
										</View>
									</>
								)}

								{pedido.cliente?.telefono2 && (
									<>
										<Text style={{ marginTop: 15 }}>Telefono secundario</Text>
										<View
											style={{
												flexDirection: 'row',
												backgroundColor: '#f6f6f6',
												borderRadius: 10,
												minHeight: 50,
												padding: 10,
												marginTop: 2,
												alignItems: 'center',
												justifyContent: 'space-between',
											}}
										>
											<Text variant="headlineMedium">{pedido.cliente?.telefono2}</Text>
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
													Linking.openURL(`tel:${pedido.cliente?.telefono2}`);
												}}
											>
												<MaterialCommunityIcons name="cellphone" size={40} color="black" />
											</TouchableOpacity>
										</View>
									</>
								)}
							</View>
						)}
					</>
					{/* )} */}
					{/* </Formik> */}
				</ScrollView>
			</Layout>
		</KeyboardAvoidingView>
	);
}

const estados = [
	{ label: 'Pendiente', value: 1 },
	{ label: 'En Curso', value: 2 },
	{ label: 'Finalizado', value: 3 },
];
