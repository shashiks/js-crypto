import React, { Component } from 'react';
import { Label} from 'react-bootstrap'
import logo from './logo.svg';
import './App.css';
//npm install jsencrypt --save
import JSEncrypt from 'jsencrypt';

//continued imports of dependencies

//npm install crypto-js
const CryptoJS = require("crypto-js");


const ipfsAPI = require('ipfs-api')

const divider = ":::";

//code variables

const ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' })
var me = null;
var keySize = 256;
var ivSize = 128;
var iterations = 100;
var pass = 'welcome123';


//random chars for AES key
var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz*&-%/!?*+=()";

//paths to pub keys
var clientPubKeyHash = "QmeahL37PrQYBB8kP5ugWqSuszptWE8reEXhvThryPyRgV/cli_rsa_1024_pub.pem";

var srvrPubKeyHash = "QmVRCpUuZ3BHyFxqmpPqCnN55mQYa1LMoymPMMCfv1QPYr/srvr_rsa_1024_pub.pem";


class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            id: null,
            version: null,
            protocol_version: null,
            added_file_hash: null,
            added_file_contents: null,
            fileId: null,
            decryptedData: null,
            encryptedData: null,
            priKey: null,
        }

      me = this;  

    }


      // create a key for symmetric encryption
      // pass in the desired length of your key
    genRndKeyString = (keyLength) => {
        var randomstring = '';
        
        for (var i=0; i < keyLength; i++) {
          var rnum = Math.floor(Math.random() * chars.length);
          randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    }

    // encrypt a javascript object into a payload to be sent
    // to a server or stored on the client
    encrypt = (publicKey) => {
     

      let data = this.refs.mydata.value;
      // console.log('mydata '  + data);
      // Create a new encryption key (with a specified length)
      var key = this.genRndKeyString(56);
      console.log('aes key ' + key);

      // WE WILL SEND STRING ONLY FOR NOW, convert data to a json string
      //var dataAsString = JSON.stringify(data);

      // encrypt the data symmetrically 
      // (the cryptojs library will generate its own 256bit key!!)
      var aesEncrypted = CryptoJS.AES.encrypt(data, key);


      // get the symmetric key and initialization vector from
      // (hex encoded) and concatenate them into one string
      var aesKey = aesEncrypted.key + divider + aesEncrypted.iv;
      console.log('aesKey ' + aesKey);

      //var decrypted = CryptoJS.AES.decrypt(aesEncrypted, aesEncrypted.key, { iv: aesEncrypted.iv });
      // console.log('immediate decrypt ' + decrypted.toString(CryptoJS.enc.Utf8));

      // the data is base64 encoded 
      var encryptedMessage = aesEncrypted.toString();
      console.log('AESed msg ' + encryptedMessage)


      // we create a new JSEncrypt object for rsa encryption
      var jsencrypt = new JSEncrypt();
      
      // we set the public key (which we passed into the function
      // console.log("pk.  " + publicKey);
      jsencrypt.setPublicKey(publicKey);
      // now we encrypt the key & iv with our public key
      var encryptedKey = jsencrypt.encrypt(aesKey);
      

      console.log('encrypted AES key  ' + encryptedKey);
      // and concatenate our payload message
      var payload = encryptedKey + divider + encryptedMessage;

      console.log("payload " + payload);

      this.refs.cyphertext.value = payload;
      return payload;
    }


    decrypt = () => {

      var prikey = this.refs.prik.value;
      var cypher = this.refs.cyphertext.value;

      var key_msg = cypher.split(divider);
     

      var jsencrypt = new JSEncrypt();
      jsencrypt.setPrivateKey(prikey);

      //decrypt the AES key first 
      var aesEcryptedKeyWithIv = jsencrypt.decrypt(key_msg[0]);
      // console.log("aedEcryptedKey" + aedEcryptedKey);      
      var key_iv = aesEcryptedKeyWithIv.split(divider);
      console.log("key and iv :: " + key_iv[0] + " iv " + key_iv[1]);      



      // var decodedMsg = CryptoJS.enc.Base64.parse(key_msg[1]);

      // var origKey = CryptoJS.enc.Base64.parse(key_iv[0]);
      // var origIv = CryptoJS.enc.Base64.parse(key_iv[1]);
      // console.log('orig key and val ' + origKey + " iv " + origIv);
      // console.log('decodedMsg ' + decodedMsg );


      // console.log('msg text ' + key_msg[1]);


      var bytes  = CryptoJS.AES.decrypt(key_msg[1], key_iv[0], {iv: key_iv[1]});
      console.log("final bytes" + bytes);

      var plaintext = bytes.toString(CryptoJS.enc.Utf8);
      console.log("final text" + plaintext);
      





    }
   


    encryptForClient = () => {

        var keyHash = clientPubKeyHash;

        ipfs.cat(keyHash, function(err, res) {
            if(err || !res) return console.error("ipfs cat error", err, res);
            if(res.readable) {
              console.error('unhandled: cat result is a pipe', res);
            } else {
              let s = res.toString();
              console.log(s);
              me.encrypt(s);
              
            }
        });

    }


    render() {
       
        return (
            <div className="App">

              <div>

                <div className="page-header">
                    <h3> Encryption Demo </h3>
                </div>

                <div className="jumbotron col-sm-10 col-sm-offset-1" >

                    <div className="panel panel-primary">

                        <div className="row panel">
                            

                            <div className="col-sm-3">
                                <form className="form-inline">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <Label bsClass="col-sm-3 text-left">Text To encrypt</Label>
                                            <input type="text" className="form-control text-center" ref="mydata" id="mydata"  />
                                            <Label bsClass="col-sm-3 text-left">Private Key</Label>
                                             <textarea value={this.state.priKey} ref="prik" id="prik"/>
                                            <Label bsClass="col-sm-3 text-left">Cypher Text</Label>
                                            <input type="text" className="form-control text-center" ref="cyphertext" id="cyphertext"  />

                                            <input type="button" value="Encrypt Content" id="encrypter" onClick={this.encryptForClient}/>
                                            <input type="button" value="Decrypt Content" id="decrypter" onClick={this.decrypt}/>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                       
                    </div>
                </div>
                </div> 




            </div>
        );
    }

}

export default App;