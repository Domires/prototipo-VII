import React, { useState, useEffect, useContext } from 'react'
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

import { AuthContext } from './../../contexts/AuthContext'

export default function Opcoes({ navigation }) {

    const { signOut } = useContext(AuthContext)

    const [latitude, onChangeLatitude] = useState('');
    const [longitude, onChangeLontitude] = useState('');
    const [isEnabledPortaoAutomatico, setIsEnabledPortaoAutomatico] = useState(false);
    const [isEnabledLuzAutomatica, setIsEnabledPortaoLuzAutomatica] = useState(false);
    const [isEnabledLuzAlarmeAutomatico, setIsEnabledLuzAlarmeAutomatico] = useState(false);

    const toggleSwitch1 = () => setIsEnabledPortaoAutomatico(previousState => !previousState);
    const toggleSwitch2 = () => setIsEnabledPortaoLuzAutomatica(previousState => !previousState);
    const toggleSwitch3 = () => setIsEnabledLuzAlarmeAutomatico(previousState => !previousState);

    useEffect(() => {
        const bootstrapAsync = async () => {
            let lat = await AsyncStorage.getItem('latitude')
            let lng = await AsyncStorage.getItem('longitude')
            let pA = await AsyncStorage.getItem('portaoAutomatico')
            let lA = await AsyncStorage.getItem('luzAutomatica')
            let lAA = await AsyncStorage.getItem('luzAlarmeAutomatico')

            onChangeLatitude(lat)
            onChangeLontitude(lng)
            pA == 'true' ? setIsEnabledPortaoAutomatico(true) : setIsEnabledPortaoAutomatico(false)
            lA == 'true' ? setIsEnabledPortaoLuzAutomatica(true) : setIsEnabledPortaoLuzAutomatica(false)
            lAA == 'true' ? setIsEnabledLuzAlarmeAutomatico(true) : setIsEnabledLuzAlarmeAutomatico(false)
        }
        bootstrapAsync()
    }, [])

    return (
        <View style={styles.container}>

            <View style={{ flexDirection: "row", marginTop: 30 }}>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    onValueChange={toggleSwitch1}
                    value={isEnabledPortaoAutomatico}
                />
                <Text style={{ marginTop: 3 }}>Abrir portão automaticamente</Text>
            </View>

            <Text style={{ alignSelf: 'center', marginTop: 30, marginBottom: 20 }}>COORDENADAS DO LOCAL</Text>

            <View style={{ flexDirection: "row", justifyContent: 'space-around' }}>
                <TextInput
                    editable={isEnabledPortaoAutomatico}
                    style={styles.input}
                    onChangeText={onChangeLatitude}
                    value={latitude}
                    placeholder="Latitude"
                    keyboardType="numeric"
                />
                <TextInput
                    editable={isEnabledPortaoAutomatico}
                    style={styles.input}
                    onChangeText={onChangeLontitude}
                    value={longitude}
                    placeholder="Longitude"
                    keyboardType="numeric"
                />
            </View>

            <View style={{ flexDirection: "row", marginTop: 30 }}>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    onValueChange={toggleSwitch2}
                    value={isEnabledLuzAutomatica}
                />
                <Text style={{ marginTop: 3 }}>Ligar luz automaticamente ao abrir portão</Text>
            </View>

            <View style={{ flexDirection: "row", marginTop: 30 }}>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    onValueChange={toggleSwitch3}
                    value={isEnabledLuzAlarmeAutomatico}
                />
                <Text style={{ marginTop: 3 }}>Ligar luz ao disparar alarme</Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'flex-end'}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                    onPress={async () => {
                        if(latitude && longitude) {
                            await AsyncStorage.multiSet([
                                ['portaoAutomatico', isEnabledPortaoAutomatico.toString()],
                                ['latitude', latitude.toString()],
                                ['longitude', longitude.toString()],
                                ['luzAutomatica', isEnabledLuzAutomatica.toString()],
                                ['luzAlarmeAutomatico', isEnabledLuzAlarmeAutomatico.toString()]
                            ])
                        } else {
                            await AsyncStorage.multiSet([
                                ['portaoAutomatico', isEnabledPortaoAutomatico.toString()],
                                ['luzAutomatica', isEnabledLuzAutomatica.toString()],
                                ['luzAlarmeAutomatico', isEnabledLuzAlarmeAutomatico.toString()]
                            ])
                        }

                        navigation.navigate('Home')
                    }}
                    style={{ width: '48%', backgroundColor: '#000', padding: 30, alignItems: 'center', marginBottom: 10, borderRadius: 5 }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SALVAR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        signOut()
                    }}
                    style={{ width: '48%', backgroundColor: '#000', padding: 30, alignItems: 'center', marginBottom: 10, borderRadius: 5 }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SAIR</Text>
                </TouchableOpacity>
                </View>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
    input: {
        height: 40,
        margin: 12,
        borderTopWidth: 0,
        borderWidth: 1,
        padding: 10,
        width: '45%',
    },
});
