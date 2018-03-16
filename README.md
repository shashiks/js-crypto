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
<li>Use the passphrase for AES encryption</li>
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
<p>The UI for now is really bad, I will work on it as I get time.</p>