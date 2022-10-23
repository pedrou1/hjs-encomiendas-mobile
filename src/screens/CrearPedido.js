import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Layout, Text, TextInput, Button, themeColor, TopNav } from 'react-native-rapi-ui';
import { AuthContext } from '../provider/AuthProvider';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Chip, Text as TextPaper } from 'react-native-paper';
import * as pedidos from '../services/pedidos';
import * as Constantes from '../utils/Constantes';
import DateTimePicker from '@react-native-community/datetimepicker';

const horaDefault = new Date();

export default function ({ route, navigation }) {
	const { user, setUser } = useContext(AuthContext);
	const [direccion, setDireccion] = useState(null);
	const [cliente, setCliente] = useState({});
	const [tipoPedido, setTipoPedido] = useState({});
	const [tarifa, setTarifa] = useState(0);
	const [errors, setErrors] = useState({});
	const [horaLimite, setHoraLimite] = useState(horaDefault);
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

	const params = route.params;

	useEffect(() => {
		if (params?.clienteSeleccionado) setCliente(params.clienteSeleccionado);
		if (params?.tipoPedidoSeleccionado) setTipoPedido(params.tipoPedidoSeleccionado);
		if (params?.tipoPedidoSeleccionado?.tarifa) setTarifa(params.tipoPedidoSeleccionado?.tarifa.toString());
		if (params?.direccionSeleccionada) setDireccion(params.direccionSeleccionada);

		setErrors({
			cliente: false,
			tipoPedido: false,
		});
	}, [params]);

	const formSchema = yup.object({
		descripcion: yup.string(),
		apartamento: yup.string(),
		nroPuerta: yup.string(),
	});

	return (
		<KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
			<Layout>
				<TopNav
					middleContent="Crear pedido"
					leftContent={<Ionicons name="chevron-back" size={20} color={themeColor.black} />}
					leftAction={() => navigation.goBack()}
				/>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
					}}
				>
					<Formik
						initialValues={{
							descripcion: '',
							apartamento: '',
							nroPuerta: '',
						}}
						validationSchema={formSchema}
						onSubmit={async (values, e) => {
							try {
								setErrors({
									cliente: !cliente.idCliente ? true : false,
									tipoPedido: !tipoPedido.idTipoPedido ? true : false,
								});

								if (direccion && tipoPedido && cliente && tarifa) {
									const pedidoIngresadoParsedServidor = {
										...values,
										idChofer: user.idUsuario,
										idCliente: cliente.idCliente,
										tarifa: parseInt(tarifa),
										idTipoPedido: tipoPedido.idTipoPedido,
										longitude: direccion.longitude,
										latitude: direccion.latitude,
										nombreDireccion: direccion.nombreDireccion,
										idTransporte: user.unidad.idUnidadTransporte,
										estado: Constantes.ESTADO_PEDIDO_PENDIENTE,
										horaLimite:
											horaLimite && !isNaN(horaLimite) && horaLimite.getHours() != horaDefault.getHours() ? horaLimite : undefined,
									};

									const res = await pedidos.registrarPedido(pedidoIngresadoParsedServidor);

									if (res.operationResult == Constantes.SUCCESS) {
										navigation.navigate('Inicio', { pedidoIngresado: true });
									} else if (res.operationResult == Constantes.ERROR) {
										Alert.alert('Error', 'Ha ocurrido un error al crear el pedido');
									}
								}
							} catch (error) {
								console.log(error);
							}
						}}
					>
						{(props) => (
							<>
								<View
									style={{
										flex: 3,
										paddingTop: 20,
										paddingHorizontal: 20,
										paddingBottom: 20,
										backgroundColor: themeColor.white,
									}}
								>
									<Text>Dirección</Text>
									<TouchableOpacity
										onPress={() => {
											navigation.navigate('SeleccionarDireccion');
										}}
									>
										<Chip
											icon={() => <Icon name={direccion ? 'check-bold' : 'information'} size={16} color="black" />}
											style={{ padding: 10, marginTop: 2, backgroundColor: '#c9daff' }}
										>
											<TextPaper variant="titleMedium">
												{direccion ? direccion.nombreDireccion : 'Presiona para seleccionar una dirección'}
											</TextPaper>
										</Chip>
									</TouchableOpacity>

									<Text style={{ marginTop: 15 }}>Cliente</Text>
									<TouchableOpacity
										onPress={() => {
											navigation.navigate('Clientes');
										}}
									>
										<Chip
											style={{ padding: 10, marginTop: 2, backgroundColor: '#c9daff' }}
											icon={() => <Icon name={cliente?.nombre ? 'check-bold' : 'information'} size={17} color="black" />}
										>
											<TextPaper variant="titleMedium">
												{cliente?.nombre ? cliente.nombre : 'Presiona para seleccionar un cliente'}
											</TextPaper>
										</Chip>
									</TouchableOpacity>

									<Text size="sm" style={styles.error}>
										{errors.cliente && 'Ingrese un cliente'}
									</Text>

									<Text>Tipo</Text>
									<TouchableOpacity
										onPress={() => {
											navigation.navigate('TiposPedidos');
										}}
									>
										<Chip
											style={{ padding: 10, marginTop: 2, backgroundColor: '#c9daff' }}
											icon={() => <Icon name={tipoPedido?.nombre ? 'check-bold' : 'information'} size={17} color="black" />}
										>
											<TextPaper variant="titleMedium">
												{tipoPedido?.nombre ? tipoPedido.nombre : 'Presiona para seleccionar un tipo'}
											</TextPaper>
										</Chip>
									</TouchableOpacity>
									{tipoPedido.pesoDesde ? (
										<>
											<Text style={{ marginTop: 2 }}>
												<Text variant="titleSmall">{'Tarifa: '}</Text>
												<Text
													style={{
														backgroundColor: '#f6f6f6',
														borderRadius: 15,
														padding: 5,
														alignItems: 'center',
														width: '50%',
													}}
													variant="titleMedium"
												>
													{'$ ' + tipoPedido.tarifa}
												</Text>
											</Text>
											<Text>
												<Text variant="titleMedium">{'Peso desde: '}</Text>
												<Text
													style={{
														backgroundColor: '#f6f6f6',
														borderRadius: 10,
														padding: 5,
														alignItems: 'center',
														width: '50%',
													}}
													variant="titleMedium"
												>
													{tipoPedido.pesoDesde + ' kg'}
												</Text>

												<Text variant="titleMedium">{'  Peso hasta: '}</Text>
												<Text
													style={{
														backgroundColor: '#f6f6f6',
														borderRadius: 10,
														padding: 5,
														alignItems: 'center',
														width: '50%',
													}}
													variant="titleMedium"
												>
													{tipoPedido.pesoHasta + ' kg'}
												</Text>
											</Text>
										</>
									) : (
										<></>
									)}
									<Text size="sm" style={styles.error}>
										{errors.tipoPedido && 'Ingrese un tipo de pedido'}
									</Text>

									<Text>Descripción</Text>

									<TextInput
										containerStyle={{ marginTop: 5 }}
										placeholder="Introduce una descripción"
										autoCapitalize="none"
										autoCompleteType="off"
										autoCorrect={false}
										onChangeText={props.handleChange('descripcion')}
										value={props.values.descripcion}
										onBlur={props.handleBlur('descripcion')}
									/>

									{horaLimite ? (
										<>
											<Text style={{ marginTop: 15 }}>Hora Límite</Text>
											<TouchableOpacity
												onPress={() => {
													setDatePickerVisibility(true);
												}}
											>
												<Chip
													style={{ padding: 10, marginTop: 2, backgroundColor: '#ededed' }}
													icon={() => <Icon name={cliente?.nombre ? 'check-bold' : 'information'} size={17} color="black" />}
												>
													<TextPaper variant="titleMedium">
														{!isNaN(horaLimite) && horaLimite.getHours() != horaDefault.getHours()
															? `${horaLimite.getHours()}:${horaLimite.getMinutes()}`
															: 'Presiona para ingresar una hora límite'}
													</TextPaper>
												</Chip>
											</TouchableOpacity>
										</>
									) : (
										<></>
									)}

									{isDatePickerVisible && (
										<DateTimePicker
											testID="dateTimePicker"
											value={horaLimite}
											mode={'time'}
											is24Hour={true}
											onChange={(e, selectedDate) => {
												setDatePickerVisibility(false);
												if (selectedDate) setHoraLimite(selectedDate);
												else setHoraLimite(horaDefault);
											}}
										/>
									)}

									<Text style={{ marginTop: 15 }}>Apartamento</Text>

									<TextInput
										containerStyle={{ marginTop: 5 }}
										placeholder="Introduce un apartamento"
										autoCapitalize="none"
										autoCompleteType="off"
										autoCorrect={false}
										onChangeText={props.handleChange('apartamento')}
										value={props.values.apartamento}
										onBlur={props.handleBlur('apartamento')}
									/>

									<Text style={{ marginTop: 15 }}>Número de puerta</Text>

									<TextInput
										containerStyle={{ marginTop: 5 }}
										placeholder="Introduce un número de puerta"
										autoCapitalize="none"
										autoCompleteType="off"
										autoCorrect={false}
										onChangeText={props.handleChange('nroPuerta')}
										value={props.values.nroPuerta}
										onBlur={props.handleBlur('nroPuerta')}
									/>

									<View
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Button
											text={'Crear pedido'}
											onPress={props.handleSubmit}
											style={{
												marginTop: 10,
											}}
										/>
									</View>
								</View>
							</>
						)}
					</Formik>
				</ScrollView>
			</Layout>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	error: {
		color: 'red',
		marginLeft: 10,
	},
});

const estados = [
	{ label: 'Pendiente', value: 1 },
	{ label: 'En Curso', value: 2 },
	{ label: 'Finalizado', value: 3 },
];
