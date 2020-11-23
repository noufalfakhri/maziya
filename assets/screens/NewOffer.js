import React, { Component, useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView,Dimensions, Platform, StatusBar, Image, ImageBackground, ScrollView, Alert, } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { database, auth, storage } from "../config/firebase";
import { Entypo, MaterialCommunityIcons, MaterialIcons, FontAwesome, Ionicons } from '../constants/icons'
import colors from '../constants/colors'
import styles from "../constants/styles";
import SignInButton from "../components/SignInButton";
//import QRCode from 'react-native-qrcode-svg';

import { DatePicker } from 'native-base'


export default class NewOffer extends Component {

  constructor() {
    super();
    this.state = {
      OfferId: "",
      chosenDate: new Date(),
      title: "",
      Descripiton: "",
      expdate: "",
      name: '',
      code: "",
      errorMessage: null,
      errors: false,

    }
  }

  handleOfferIdChange = () => {
    this.setState({ code: this.state.OfferId });

  }

  generateQR = () => {


    return (
      <View style={styles.container}>
        <QRCode content={this.state.code}
          logo={require('../images/logo.png')} />
      </View>
    )
  }
  setDate = (newDate) => {
    this.setState({ chosenDate: newDate });
  }
  checkvalid = () => {
    let valid = true;
    if (this.state.title === "") {
      valid = false;
      this.setState({
        errors: true,
        errorMessage: "يرجى ادخال جميع البيانات",
      });
    }

    if (this.state.Descripiton === "") {
      valid = false;
      this.setState({
        errors: true,
        errorMessage: "يرجى ادخال جميع البيانات",
      });
    }

    if (this.state.OfferId === "") {
      valid = false;
      this.setState({
        errors: true,
        errorMessage: "يرجى ادخال جميع البيانات",
      });
    }
    if (this.state.chosenDate === "") {
      valid = false;
      this.setState({
        errors: true,
        errorMessage: "يرجى ادخال جميع البيانات",
      });
    }

    if (valid) {
      this.setState({
        errors: false,
      });
      this.writeOfferSP();
    }

  }

  writeOfferSP = (resp) => {
    var spName;
    database.ref('serviceProvider/'+auth.currentUser.uid).once('value',function(data){
      spName = data.val().nameBrand
    })

    /////
    // create new key to insert into table offers and use the same key to insert as a child to service provider
    var OfferId = database.ref().child("Offers").push().key

    console.log("serviceProvider");
    console.log(this.state.OfferId, "Code");
    var newOffer = {
      Descripiton: this.state.Descripiton,
      expdate: this.state.chosenDate.toDateString(),
      title: this.state.title,
      code: this.state.OfferId,
      usedCount: 0,
      favoriteCount: 0,
      nameBrand: spName,
      serviceProvider: auth.currentUser.uid
    }
    console.log("offers");

    database
      .ref()
      .child("serviceProvider")
      .child(auth.currentUser.uid)
      .child("offers")
      .child(OfferId)
      .set(newOffer)
      .then(() => {
        Alert.alert('تم إضافة العرض بنجاح')
        this.sendNotification(newOffer);
      })
      .then(this.props.navigation.pop())
      .catch((error) => console.log(error));
    var updates = {};
    updates['/Offers/' + OfferId] = newOffer;
    updates['/serviceProvider/' + auth.currentUser.uid + '/offers' + OfferId] = newOffer;

    database.ref().update(updates).then(() => null).catch(e => console.warn(e))


  };

  sendNotification = async (newOffer) => {
    //console.warn({ newOffer })
    const subscribe = database.ref('users')
    subscribe.on('value', snapshot => {
      const users = snapshot.val();
      Object.keys(users).map(key => {
        if (users[key] && users[key].push_token) {
          let response = fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: users[key].push_token,
              sound: 'default',
              title: newOffer.title,
              body: newOffer.Descripiton
            })
          })
        }
      })
      // console.warn(snapshot.val(), "data")
    })

  }

  render() {

    return (

      <View style={styless.container}>

        <StatusBar backgroundColor='#0278ae' barStyle='light-content' />
        <ScrollView style={styles.scrollView}>
        <SafeAreaView > 
                    <View style={styless.headerContainer}>
                    <TouchableOpacity>
                     <Entypo name='chevron-left' size={30} color={colors.primaryBlue} style={{ alignSelf: 'flex-start' }} onPress={() => this.props.navigation.pop()} />
                      </TouchableOpacity>
                      <View style={{ flexDirection: 'row-reverse',alignSelf:'flex-start'}}>
                    <Text style={styless.headerText} >
                     عرض جديد
                    </Text>
                    <Image source={require('../images/logoDis.jpg')} style={{ width: 100, height: 60, alignSelf: "center" }} />
                    </View>
                    </View>
              </SafeAreaView> 
            {/* error message appear here */}
            {this.state.errors && (
              <View style={styles.header}>
                <Text style={styles.errors}>{this.state.errorMessage}</Text>
              </View>
            )}
         


          <View style={styless.footer}>
            <Text style={styless.text_footer}>العنوان</Text>
            <View style={styless.action}>
              <TextInput style={styless.textInput}
                autoCapitalize="none"
                textAlign='right'
                onChangeText={(title) => this.setState({ title })} />
            </View>



            <Text style={styless.text_footer}>الوصف</Text>
            <View style={styless.action}>
              <TextInput style={styless.textInput}
                autoCapitalize="none"
                onChangeText={(Descripiton) => this.setState({ Descripiton })}
                textAlign='right' />
            </View>



            <Text style={styless.text_footer}>تاريخ إنتهاء العرض</Text>
            <View style={styless.action}>
              <DatePicker
                defaultDate={new Date()}
                minimumDate={new Date()}
                value={this.state.expdate}
                locale={"en"}
                timeZoneOffsetInMinutes={undefined}
                modalTransparent={false}
                animationType={"fade"}
                placeHolderText="التاريخ"
                textStyle={{ color: "green" }}
                textAlign='right'
                placeHolderTextStyle={{ color: "#d3d3d3" }}
                onDateChange={this.setDate}
                disabled={false}
              />
            </View>


            <View>
              <Text style={{ color: '#05375a', fontSize: 18, marginTop: 20, alignSelf: 'flex-end' }}>الرمز الترويجي</Text>

              {/* <ImageBackground source={require('../images/image.png')} style={{width:200,height:200,marginLeft:50}}> */}
              <View style={styless.action}>

                <TextInput placeholder='ادخل الرمز' style={styles.textInput, { paddingTop: 20, marginLeft: 132 }} autoCapitalize="none" onChangeText={(code) => this.setState({ code })} value={this.state.code} />
              </View>

              {/* <QRCode
      value="http://awesome.link.qr"
    /> */}

              {this.state.code == '' ? <View></View> :
                <View style={styles.QRcontainer}>
                  <QRCode
                  value={this.state.code}
                  logo={require('../images/logo.png')} 
                  size={190}
                    />
                </View>}
                

              

  

              {/* </ImageBackground> */}
            </View>



            <View style={styless.buttom}>
              <TouchableOpacity style={styless.signIn} onPress={this.checkvalid} >
                <LinearGradient
                  colors={['#0278ae', '#0278ae']}
                  style={styless.signIn}
                >
                  <Text style={[styless.textSign, { color: '#fff' }]}> إضافة عرض </Text>

                </LinearGradient>
              </TouchableOpacity>

            </View>

            {
              /* https://www.npmjs.com/package/react-native-qrcode-generator */
            }
          </View>


        </ScrollView>
      </View>
    )
  }

}

const screenWidth  = Dimensions.get("window").width;


const { height } = Dimensions.get('screen');
const height_logo = height * 0.28;

const styless = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'

  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20
  },

  header1: {
    color: '#0278ae',
    fontWeight: 'bold',
    fontSize: 25,
    marginLeft: 150,
  },

  footer: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 30
  },
  text_header: {
    paddingTop: 100,
    color: '#0278ae',
    fontWeight: 'bold',
    fontSize: 25,
    marginLeft: 150
  },
  header1: {
    color: '#0278ae',
    fontWeight: 'bold',
    fontSize: 25,
    marginLeft: 150

  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
    alignSelf: 'flex-end',
    marginTop: 10

  },
  buttom: {
    alignItems: 'flex-end',
    marginTop: 30
  },

  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5

  },
  textInput: {
    flex: 1,
    marginTop: -12,
    paddingLeft: 10,
    color: '#05375a'
  },

  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  textSign: {
    fontSize: 18,
    fontWeight: 'bold'
  }, 
    headerContainer:{
    width: screenWidth,
    height:80,
    flexDirection:'row',
    alignItems:'center'
},
headerText:{
    color:colors.primaryBlue,
    fontSize:30,}



});

