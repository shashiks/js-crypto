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



    encryptAES = () => {

      let data = this.refs.mydata.value;
      // var key = this.genRndKeyString(8);
      // console.log('aes key ' + key);
      var aesEncrypted = CryptoJS.AES.encrypt(data, pass);
      this.refs.cyphertext.value = aesEncrypted.toString();
      


    }

    decryptAES = () => {

      var cypher = this.refs.cyphertext.value;
      var bytes = CryptoJS.AES.decrypt(cypher, pass);
      var plaintext = bytes.toString(CryptoJS.enc.Utf8);
      console.log("final text " + plaintext);
      
    }



    // encrypt a javascript object into a payload to be sent
    // to a server or stored on the client
    encryptRSA = (publicKey) => {
     

      let data = this.refs.mydata.value;

      /** the RSA working code*/
      var jsencrypt = new JSEncrypt();      
      jsencrypt.setPublicKey(publicKey);
      var encryptedData = jsencrypt.encrypt(data);
      console.log('encrypted data  ' + encryptedData);

      this.refs.cyphertext.value = encryptedData;
      
    }


    decryptRSA = () => {

      var cypher = this.refs.cyphertext.value;

      /** this is RSA working code */
      var prikey = this.refs.prik.value;
      var jsencrypt = new JSEncrypt();
      jsencrypt.setPrivateKey(prikey);
      var decrytedData = jsencrypt.decrypt(cypher);
      console.log('decrypteddata '+ decrytedData);
      this.setState({decryptedData: decrytedData})
     
    }
   


    encryptUsingRSA = () => {

        var keyHash = clientPubKeyHash;

        ipfs.cat(keyHash, function(err, res) {
            if(err || !res) return console.error("ipfs cat error", err, res);
            if(res.readable) {
              console.error('unhandled: cat result is a pipe', res);
            } else {
              let s = res.toString();
              // console.log(s);
              me.encryptRSA(s);
              
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
                                            <input type="text" className="form-control text-center" ref="mydata" id="mydata"  /><br></br><br></br>
                                            <Label bsClass="col-sm-3 text-left">Private Key</Label>
                                             <textarea value={this.state.priKey} ref="prik" id="prik"/><br></br><br></br>
                                            <Label bsClass="col-sm-3 text-left">Cypher Text</Label>
                                            <input type="text" className="form-control text-center" ref="cyphertext" id="cyphertext"  /><br></br><br></br>
                                            <Label bsClass="col-sm-3 text-left">Decrypted text :: {this.state.decryptedData}</Label><br></br><br></br>

                                            <input type="button" value="Encrypt Content" id="encrypter" onClick={this.encryptAES}/>
                                            <input type="button" value="Decrypt Content" id="decrypter" onClick={this.decryptAES}/>
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