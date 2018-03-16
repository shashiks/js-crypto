import React, { Component } from 'react';
import { Label} from 'react-bootstrap'
import logo from './logo.svg';
import './App.css';

var CryptoJS = require("crypto-js");
const ipfsAPI = require('ipfs-api')



const ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' })
var me = null;
var keySize = 256;
var ivSize = 128;
var iterations = 100;
var pass = 'welcome123';



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
            encryptedData: null
        }

      me = this;  

    }


    getPublicKey = () => {

        var fileName = "QmeahL37PrQYBB8kP5ugWqSuszptWE8reEXhvThryPyRgV/cli_rsa_1024_pub.pem";
        ipfs.cat(fileName, function(err, res) {
            if(err || !res) return console.error("ipfs cat error", err, res);
            if(res.readable) {
              console.error('unhandled: cat result is a pipe', res);
            } else {
              console.log(res.toString());
              
            }
        });



    }

    encrypt = () => {


      var msg = this.refs.mydata.value;
      var salt = CryptoJS.lib.WordArray.random(128/8);
      console.log('salt ' + salt);
      console.log('msg ' + msg);

      var key = CryptoJS.PBKDF2(pass, salt, {
          keySize: keySize/32,
          iterations: iterations
        });

      var iv = CryptoJS.lib.WordArray.random(128/8);

      var encrypted = CryptoJS.AES.encrypt(msg, key, { 
        iv: iv, 
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

      });

      // salt, iv will be hex 32 in length
      // append them to the ciphertext for use  in decryption
      var transitmessage = salt.toString()+ iv.toString() + encrypted.toString();
      this.setState({ encryptedData: transitmessage });
      console.log('encrypted ' + transitmessage);
    }

   decrypt = () => {

      var transitmessage = this.state.encryptedData;

      var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
      var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
      var encrypted = transitmessage.substring(64);

      var key = CryptoJS.PBKDF2(pass, salt, {
          keySize: keySize/32,
          iterations: iterations
        });

      var decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
        iv: iv, 
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

      })

      //this.setState({ decryptedData: decrypted });
      console.log('decrypted ' + decrypted.toString(CryptoJS.enc.Utf8));

    }


  
  writeFile = () => {
        var content = this.refs.filecontent.value;
        console.log('cnoent is ' + content);
        ipfs.add([Buffer.from(content)], (err, res) => {
            if (err) throw err;
            const hash = res[0].hash;
            this.setState({ added_file_hash: hash });
        })
    }


    


    readFile = () => {
        var hash = this.refs.filehash.value;

        console.log('hash is ' + hash);

         ipfs.cat(hash, function(err, res) {
            if(err || !res) return console.error("ipfs cat error", err, res);
            if(res.readable) {
              console.error('unhandled: cat result is a pipe', res);
            } else {
              console.log(res.toString());
              me.setState({ added_file_contents: res.toString() });
            }
        });

    }

    render() {
       
        return (
            <div className="App">

              <div>

                <div className="page-header">
                    <h3> IPFS Demo </h3>
                    <h4> <small> Sweet little IPFS demo </small> </h4>
                </div>

                <div className="jumbotron col-sm-10 col-sm-offset-1" >

                    <div className="panel panel-primary">

                        <div className="panel-heading">
                            <div className="row">
                                <Label bsClass="col-sm-3 text-center"> Hash/Content to use</Label>
                                <Label bsClass="col-sm-3 text-center"> Value </Label>
                                <Label bsClass="col-sm-3 text-center"> Submit </Label>
                            </div>
                        </div>

                        <div className="row panel">
                            <Label bsClass="col-sm-3 text-left">Text To save</Label>

                            <div className="col-sm-3">
                                <form className="form-inline">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <input type="text" className="form-control text-center" ref="filecontent" id="filecontent"  />
                                            <input type="button" value="Write File" id="addfile" onClick={this.writeFile}/>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <Label bsClass="col-sm-3 text-center">{this.state.added_file_hash}</Label>
                        </div>

                        <div className="row panel">
                            <Label bsClass="col-sm-3 text-left">View File Content</Label>

                            <div className="col-sm-3">
                                <form className="form-inline">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <input type="text" className="form-control text-center" ref="filehash" id="filehash"  />
                                            <input type="button" value="Read File" id="readfile" onClick={this.readFile}/>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <Label bsClass="col-sm-3 text-center">{this.state.added_file_contents}</Label>
                        </div>

                    </div>
                </div>
                </div> 


                 <div>

                <div className="page-header">
                    <h3> Encryption Demo </h3>
                </div>

                <div className="jumbotron col-sm-10 col-sm-offset-1" >

                    <div className="panel panel-primary">

                        <div className="row panel">
                            <Label bsClass="col-sm-3 text-left">Text To encrypt</Label>

                            <div className="col-sm-3">
                                <form className="form-inline">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <input type="text" className="form-control text-center" ref="mydata" id="mydata"  />
                                            <input type="button" value="Encrypt Content" id="encrypter" onClick={this.encrypt}/>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <Label bsClass="col-sm-3 text-center">{this.state.encryptedData}</Label>
                        </div>

                        <div className="row panel">
                            <Label bsClass="col-sm-3 text-left">Decrypted Content</Label>

                            <div className="col-sm-3">
                                <form className="form-inline">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <input type="button" value="Decrypt" id="decryptor" onClick={this.decrypt}/>

                                            <input type="button" value="Read Key" id="keyreader" onClick={this.readPublicKey}/>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <Label bsClass="col-sm-3 text-center">{this.state.decryptedData}</Label>
                        </div>

                    </div>
                </div>
                </div> 




            </div>
        );
    }

}

export default App;