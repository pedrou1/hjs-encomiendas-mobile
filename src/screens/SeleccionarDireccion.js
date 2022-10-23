import React, { useContext, useState, useRef, useMemo, useEffect } from 'react';
import { View, Linking, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Layout, Text } from 'react-native-rapi-ui';
import { AuthContext } from '../provider/AuthProvider';
import BottomSheet, { BottomSheetFlatList, TouchableHighlight } from '@gorhom/bottom-sheet';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import tw from 'tailwind-react-native-classnames';
import { FAB, Button } from 'react-native-paper';

const GOOGLE_API_KEY = process.env.PLACES_API_BASE.toString();
const montevideoCoords = { latitude: -34.90658452897425, longitude: -56.18052889728755, latitudeDelta: 0.09, longitudeDelta: 0.035 };

export default function ({ navigation }) {
	const mapViewRef = useRef(null);
	const calloutRef = useRef(null);
	const autocompleteRef = useRef(null);
	const [driverLocation, setDriverLocation] = useState({ latitude: -34.90658452897425, longitude: -56.18052889728755 });
	const [direccion, setDireccion] = useState(null);
	const bottomSheetRef = useRef(null);
	const snapPoints = useMemo(() => ['15%', '90%']);

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (!status === 'granted') {
				console.log('Debes permitir el acceso a la ubicación');
				return;
			}

			let location = await Location.getCurrentPositionAsync();
			setDriverLocation({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			});
		})();
	}, []);

	useEffect(() => {
		if (autocompleteRef.current && autocompleteRef.current?.isFocused()) {
			bottomSheetRef.current?.snapToIndex(1);
		}
	}, [autocompleteRef]);

	const onMarkerPressed = (marker) => {};

	return (
		<Layout>
			<View style={{ mt: 15 }}>
				<MapView initialRegion={montevideoCoords} ref={mapViewRef} style={styles.map} provider="google" showsUserLocation followsUserLocation>
					{direccion && (
						<Marker
							key={direccion.nombreDireccion}
							onPress={() => onMarkerPressed(direccion)}
							coordinate={direccion ? { latitude: direccion.latitude, longitude: direccion.longitude } : {}}
							ref={calloutRef}
						>
							<Callout>
								<View>
									<Text style={{ fontSize: 15 }}>{direccion.nombreDireccion}</Text>
								</View>
							</Callout>
						</Marker>
					)}
				</MapView>
			</View>
			<BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={1} animateOnMount={false}>
				<View style={tw`bg-white flex-1 h-full`}>
					{direccion ? (
						<Button
							icon="check"
							mode="contained"
							style={{ marginLeft: 15, marginRight: 15, marginBottom: 10, backgroundColor: '#6377A4' }}
							labelStyle={{ fontSize: 25 }}
							onPress={() =>
								navigation.navigate('CrearPedido', {
									direccionSeleccionada: direccion,
								})
							}
						>
							<Text style={{ fontSize: 17, color: 'white' }}>Confirmar</Text>
						</Button>
					) : (
						<Text style={tw`text-center py-3 text-xl`}>Ingresa una dirección</Text>
					)}

					<View style={tw`border-t border-gray-200 flex-shrink`}>
						<GooglePlacesAutocomplete
							ref={autocompleteRef}
							placeholder="Busca una dirección"
							fetchDetails={true}
							GooglePlacesSearchQuery={{
								rankby: 'distance',
							}}
							onChangeText={(text) => {
								// console.log(text);
							}}
							onPress={(data, details = null) => {
								autocompleteRef.current?.setAddressText(data.description.substring(0, 65));
								bottomSheetRef.current?.collapse();
								setDireccion({
									nombreDireccion: data.description,
									latitude: details.geometry.location.lat,
									longitude: details.geometry.location.lng,
								});
								//settimeout
								setTimeout(() => {
									mapViewRef.current?.animateToRegion(
										{
											longitude: details.geometry.location.lng,
											latitude: details.geometry.location.lat,
											latitudeDelta: 0.09,
											longitudeDelta: 0.035,
										},
										500
									);
									setTimeout(function () {
										calloutRef.current.showCallout();
									}, 1);
								}, 1000);
							}}
							query={{
								//FIXME .env
								key: GOOGLE_API_KEY,
								language: 'es',
								components: 'country:uy',
								radius: 30000,
								location: `${montevideoCoords.latitude}, ${montevideoCoords.longitude}`,
							}}
							renderRow={(rowData) => {
								const title = rowData.structured_formatting.main_text;
								const address = rowData.structured_formatting.secondary_text;
								return (
									<TouchableHighlight>
										<>
											<Text style={{ fontSize: 14 }}>{title}</Text>
											<Text style={{ fontSize: 14 }}>{address}</Text>
										</>
									</TouchableHighlight>
								);
							}}
							styles={toInputBoxStyle}
						/>
					</View>
				</View>
			</BottomSheet>
		</Layout>
	);
}

const styles = StyleSheet.create({
	map: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height - 75,
	},
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
	},
});

const toInputBoxStyle = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		paddingTop: 20,
		flex: 0,
		height: Dimensions.get('window').height - 75,
	},
	textInput: {
		backgroundColor: '#DDDDDF',
		borderRadius: 5,
		fontSize: 18,
	},
	textInputContainer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
});
