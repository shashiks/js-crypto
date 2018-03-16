/**
This code demonstrates different encryption mechanisms using Symmetric (AES) and Assymetric (RSA) encryptions.
For this the libraries used are :
<p>For AES: cryptojs/aes: https://code.google.com/p/crypto-js/#AES
<p>For RSA: https://github.com/travist/jsencrypt
<p>We only refer to them using node install modules. commands listed above the imports
for each.
<p>RSA Private and public keys were generated using openssl with below commands
<pre>
openssl genrsa -out rsa_1024_priv.pem 1024
openssl rsa -pubout -in rsa_1024_priv.pem -out rsa_1024_pub.pem
</pre>
you could use any size from 1024 - 4096

<p>We use the same approach as SSL/TlS to (de)encrypt and possibly share data. Steps are:
<ol>
<li>Generate a random passphrase </li>
<li>Use the passphrase while AES encryption</li>
<li>Encrypt the random generated key and the AES encrypted data using RSA public key</li>
</ol>
<p>To decrypt we do the reverse of above steps but use the private key to decrypt the RSA 
ecnrypted data first. Then use the AES key to decrypt the original content.

<p>Note: The random passphrase you generate is only a seed for the actual AES key and its not the actual key</p>

<p>The public key is looked up from IPFS. And the private key is expected to be pasted in the textarea
for decrpyption. There are a lot of scenarios and approach that can be implemented for looking up 
and reading the assymetric keys. But that will come later.
<p>In case you want to decrypt on server side using other languages like Java/C# etc. then 
you need to remember that the RSA cypher is base64 encoded and AES values you see are hex encoded.
So you will need to decode them to bytes before passing them to you respective libraries, incase
they dont do it themselves.


*/

import React, { Component } from 'react';
import { Label} from 'react-bootstrap'
import logo from './logo.svg';
import './App.css';
//npm install jsencrypt --save
import JSEncrypt from 'jsencrypt';


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
var phrase = null;


//random chars for AES key
var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz*&-%/!?*+=()";

//path to pub keys in IPFS
var clientPubKeyHash = "QmeahL37PrQYBB8kP5ugWqSuszptWE8reEXhvThryPyRgV/cli_rsa_1024_pub.pem";


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
    genPassPhrase = (keyLength) => {
        var randomstring = '';
        
        for (var i=0; i < keyLength; i++) {
          var rnum = Math.floor(Math.random() * chars.length);
          randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    }



    encrypt = (publicKey) => {
      
      //read the data to encrypt
      let data = this.refs.mydata.value;
      //generate a random password for creating AES key
      var key = this.genPassPhrase(8);
      console.log('aes key ' + key);
      
      //aes encrypt the data usign that key
      var aesEncrypted = CryptoJS.AES.encrypt(data, key);
      
      //now concat and encrypt the key and the encrypted data using the
      //public key provided
      var content = key + divider + aesEncrypted;

      var jsencrypt = new JSEncrypt(); 

      //set the RSA public key for the API     
      jsencrypt.setPublicKey(publicKey);
      var encryptedData = jsencrypt.encrypt(content);
      console.log('RSA encrypted data  ' + encryptedData);

      this.refs.cyphertext.value = encryptedData;


    }

    decrypt = () => {
      
      //read the encrypted data from somewhere
      var cypher = this.refs.cyphertext.value;

      /** get the private key from somewhere */
      var prikey = this.refs.prik.value;

      var jsencrypt = new JSEncrypt();
      //set the private key for decrypting
      jsencrypt.setPrivateKey(prikey);

      //AES key and the decrypted data
      var decrytedData = jsencrypt.decrypt(cypher);
      console.log('RSA decrypteddata '+ decrytedData);

      if(decrytedData) {
          //split the string first is key and second is AES encrypted data
          var arr = decrytedData.split(divider);
          var bytes = CryptoJS.AES.decrypt(arr[1], arr[0]);

          var plaintext = bytes.toString(CryptoJS.enc.Utf8);
          console.log("final text " + plaintext);


          this.setState({decryptedData: plaintext})
        } else {
          this.setState({decryptedData: "Can't decrypt with given key"})
        }


    }


    encryptAES = () => {

      let data = this.refs.mydata.value;
      var key = this.genPassPhrase(8);
      console.log('aes key ' + key);
      
      var aesEncrypted = CryptoJS.AES.encrypt(data, key);
      this.refs.cyphertext.value = aesEncrypted.toString();
      


    }

    decryptAES = () => {

      var cypher = this.refs.cyphertext.value;
      var bytes = CryptoJS.AES.decrypt(cypher, phrase);
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
   


    encryptE2E = () => {

        var keyHash = clientPubKeyHash;

        ipfs.cat(keyHash, function(err, res) {
            if(err || !res) return console.error("ipfs cat error", err, res);
            if(res.readable) {
              console.error('unhandled: cat result is a pipe', res);
            } else {
              let s = res.toString();
              // console.log(s);
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
                                            <input type="text" className="form-control text-center" ref="mydata" id="mydata"  /><br></br><br></br>
                                            <Label bsClass="col-sm-3 text-left">Private Key</Label>
                                             <textarea value={this.state.priKey} ref="prik" id="prik"/><br></br><br></br>
                                            <Label bsClass="col-sm-3 text-left">Cypher Text</Label>
                                            <input type="text" className="form-control text-center" ref="cyphertext" id="cyphertext"  /><br></br><br></br>
                                            <Label bsClass="col-sm-3 text-left">Decrypted text :: {this.state.decryptedData}</Label><br></br><br></br>

                                            <input type="button" value="Encrypt Content" id="encrypter" onClick={this.encryptE2E}/>
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