import React, { useState, useContext } from 'react';
import { TouchableOpacity, Text, TextInput, View, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext'

export default function Login({ navigation }) {

    const [rtsp, setRstp] = useState('')
    const [mqttBroker, setMqttBroker] = useState('')
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')

    const { signIn } = useContext(AuthContext)

    const loginHandle = (rtsp, mqttBroker, user, password) => {
        if (rtsp && mqttBroker && user && password) {
            signIn(rtsp, mqttBroker, user, password)
        } else {
            console.log('falta alguma coisa')
        }
    }

    return (
        <View>
            <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ marginHorizontal: 15 }}>
                        <Text
                            style={{ textAlign: 'center', marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>
                            RTSP - CÂMERA
                        </Text>
                        <TextInput
                            placeholder='rtsp://192.168.0.110:8554/mjpeg/1'
                            style={{ borderWidth: 2, textAlign: 'center' }}
                            onChangeText={text => setRstp(text)}
                            value={rtsp}
                        />

                        <Text
                            style={{ textAlign: 'center', marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>
                            MQTT BROKER
                        </Text>
                        <TextInput
                            placeholder='mqtt://192.168.0.105:1883'
                            style={{ borderWidth: 2, textAlign: 'center' }}
                            onChangeText={text => setMqttBroker(text)}
                            value={mqttBroker}
                        />

                        <Text
                            style={{ textAlign: 'center', marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>
                            USUÁRIO MQTT
                        </Text>
                        <TextInput
                            style={{ borderWidth: 2, textAlign: 'center' }}
                            onChangeText={text => setUser(text)}
                            value={user}
                        />

                        <Text
                            style={{ textAlign: 'center', marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>
                                SENHA MQTT
                        </Text>
                        <TextInput
                            style={{ borderWidth: 2, marginBottom: 30, textAlign: 'center' }}
                            secureTextEntry={true}
                            onChangeText={text => setPassword(text)}
                            value={password}
                        />
                        <TouchableOpacity
                            onPress={() => loginHandle(rtsp, mqttBroker, user, password)}
                            style={{ backgroundColor: '#000', alignItems: 'center', borderRadius: 5, padding: 20 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>ENTRAR</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    )
}