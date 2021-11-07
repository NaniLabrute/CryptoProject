const request = require('simple-get');
const sodium = require('libsodium-wrappers');

var url = 'https://79vo67ipp9.execute-api.eu-west-1.amazonaws.com/Prod/decrypt/challenges/'
var kid, key, challenge, nonce, options;

async function main(){
    options = {
        method: 'POST',
         url: url,
         json: true
       }

    // send a post request
    await request.concat(options, function (err, res, data) {
        if (err) throw err
        kid = data.kid

        // decode key, challenge and nonce
        key = sodium.from_base64(data.key, sodium.base64_variants.ORIGINAL)
        challenge = sodium.from_base64(data.challenge, sodium.base64_variants.ORIGINAL)
        nonce = sodium.from_base64(data.nonce, sodium.base64_variants.ORIGINAL)

        // decrypte the challenge
        challenge = sodium.crypto_secretbox_open_easy(challenge, nonce, key);
        // encode the challenge
        challenge = sodium.to_base64(challenge, sodium.base64_variants.ORIGINAL);

        // call the function hulp that make a delete request with the encoded challenge
        hulp()
    })
}

async function hulp(){

    body = {'plaintext': challenge}

    options = {
        method: 'DELETE',
        url: url + kid,
        // the property body need to recieve string
        body: JSON.stringify(body)
       }

    await request.delete(options, function (err, res) {
        if (err) throw err
        res.pipe(process.stdout)
    })
}

// main
main()
