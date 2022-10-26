import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Layout, Text, TextInput, themeColor, TopNav } from 'react-native-rapi-ui';
import { AuthContext } from '../provider/AuthProvider';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Chip, Button } from 'react-native-paper';
import * as pedidos from '../services/pedidos';
import * as Constantes from '../utils/Constantes';
import { AntDesign } from '@expo/vector-icons';

export default function ({ route, navigation }) {
	const [pedido, setPedido] = useState(null);
	const [coordinates, setCoordinates] = useState([]);

	const params = route.params;

	useEffect(() => {
		if (params?.pedido) {
			setPedido(params.pedido);
		}
		if (params?.coordinates) {
			setCoordinates(params.coordinates);
		}
	}, [params]);

	const changeIndexPedido = (idPedido, haciaArriba) => {
		let newPedidos = [...coordinates];
		let index = newPedidos.findIndex((pedido) => pedido.idPedido === idPedido);
		let aux = newPedidos[index];

		if (index != 0 && haciaArriba) {
			newPedidos[index] = newPedidos[index - 1];
			newPedidos[index - 1] = aux;
			setCoordinates(newPedidos);
		} else if (index != newPedidos.length - 1 && !haciaArriba) {
			newPedidos[index] = newPedidos[index + 1];
			newPedidos[index + 1] = aux;
			setCoordinates(newPedidos);
		}
	};

	return (
		<KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
			<Layout>
				<TopNav
					middleContent="Reordenar pedido"
					leftContent={<Ionicons name="chevron-back" size={20} color={themeColor.black} />}
					leftAction={() => navigation.goBack()}
				/>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
					}}
				>
					<>
						{coordinates && (
							<View
								style={{
									flex: 3,
									paddingTop: 20,
									paddingHorizontal: 10,
									paddingBottom: 20,
									backgroundColor: themeColor.white,
								}}
							>
								{coordinates?.length ? (
									coordinates.map((item, index) => (
										<View key={item.nombreDireccion}>
											<View
												style={{
													flexDirection: 'row',
													marginLeft: 5,
													marginRight: 5,
													paddingVertical: 5,
													backgroundColor: '#f4f4f4',
													marginTop: 5,
													borderRadius: 15,
													minHeight: 50,
												}}
											>
												<TouchableOpacity
													style={{ width: '70%', flexDirection: 'row', borderRightWidth: 1, borderRightColor: '#d3d3d3' }}
													onPress={() => {
														navigation.navigate('VerPedido', { pedido: item });
													}}
												>
													<View style={{ width: '8%', justifyContent: 'center', marginRight: 5 }}>
														<View
															style={{
																width: 20,
																height: 20,
																justifyContent: 'center',
																borderRadius: 20 / 2,
																backgroundColor: 'grey',
																marginLeft: 2,
															}}
														>
															<Text
																style={{
																	alignSelf: 'center',
																	fontWeight: 'bold',
																	color: 'white',
																	fontSize: 15,
																}}
															>
																{index + 1}
															</Text>
														</View>
													</View>

													<View
														style={{
															width: '95%',
															textAlign: 'center',
															display: 'flex',
															flexDirection: 'column',
															justifyContent: 'center',
														}}
													>
														<Text style={{ fontSize: 18, fontWeight: '500' }}>{`${item.nombreDireccion.substring(0, 55)}${
															item.nombreDireccion.length > 55 ? '...' : ''
														}`}</Text>
														{item.cliente && (
															<Text style={{ color: 'grey' }}>{`${item.cliente.nombre} ${
																item.cliente.apellido ? item.cliente.apellido : ''
															}`}</Text>
														)}
													</View>
												</TouchableOpacity>
												{pedido && pedido.idPedido == item.idPedido ? (
													<>
														<TouchableOpacity
															style={{
																width: '15%',
																color: 'white',
																display: 'flex',
																flexDirection: 'row',
																justifyContent: 'center',
																alignItems: 'center',
															}}
															disabled={index == coordinates.length - 1}
															onPress={() => {
																changeIndexPedido(pedido.idPedido, false);
															}}
														>
															<AntDesign
																name="downcircleo"
																size={45}
																color={index != coordinates.length - 1 ? 'black' : 'silver'}
															/>
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
															disabled={index == 0}
															onPress={() => {
																changeIndexPedido(pedido.idPedido, true);
															}}
														>
															<AntDesign name="upcircleo" size={45} color={index != 0 ? 'black' : 'silver'} />
														</TouchableOpacity>
													</>
												) : (
													<></>
												)}
											</View>
										</View>
									))
								) : (
									<></>
								)}
							</View>
						)}
					</>
					<View style={{ paddingLeft: 90, paddingRight: 90, backgroundColor: 'white' }}>
						<Button
							mode="contained"
							style={{ marginBottom: 10, backgroundColor: '#485778', marginTop: 40 }}
							labelStyle={{ fontSize: 25 }}
							onPress={() => navigation.navigate('Inicio', { coordinates: coordinates })}
						>
							<Text style={{ fontSize: 17, color: 'white' }}>Confirmar</Text>
						</Button>
					</View>
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
