[![build status](http://img.shields.io/travis/CZ-NIC/mojeid-connect-js/25859-lib-lite.svg?style=flat)](https://travis-ci.org/CZ-NIC/mojeid-connect-js)


# MojeID LITE Connect library

The javascript library **MojeID LITE** (or mojeID Connect) allows loading myID data into a client-side web page using the OpenID Connect protocol.

This functionality can be used, for example, to easily pre-fill the web form with the details of a user who has an active mojeID account.

Description of the library (in Czech) can be found on the page [4.1.11. Knihovna MojeID LITE](https://www.mojeid.cz/dokumentace/html/ImplementacePodporyMojeid/OpenidConnect/KnihovnaJS.html).

### Installation

Install package from `npm`:

```
npm install @cz-nic/mojeid-connect
```

### Try the package examples

The package contains examples that you can try immediately. Follow instructions:

Create symlinks to the distributed library and node modules:

```
ln -s ../../../ node_modules/@cz-nic/mojeid-connect/examples/node_modules
ln -s ../dist node_modules/@cz-nic/mojeid-connect/examples/dist
```

Data transfer between provider and client is possible only via https protocol. You must have your own web server communicating over HTTPS.

#### Install your own testing local web server:

```
npm install http-server
```

To test over secure layer HTTPS on your `localhost`, you must first generate your own certificate. Generate self signed certificate for your `localhost`. Files `cert.pem` and `key.pem` are created.

#### Create self signed SSL certificate:

```
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -nodes -subj "/CN=localhost"
```

Run web server under HTTPS protocol on your `localhost` on a port `8000`:

```
node_modules/http-server/bin/http-server ./node_modules/@cz-nic/mojeid-connect/examples/ --ssl --cert cert.pem --key key.pem -p 8000
```

#### Test package examples on your local web:

Open your browser and enter the url: https://localhost:8000/. Skip warning "Your connection is not private" by clicking to button "Advanced settings" and "Continue to localhost (unreliable)". This is caused by self signed certificate, that you have created.

Now you can test prefill form on prepared examples.

### Usage in your project

Check the examples in the folder `node_modules/@cz-nic/mojeid-connect/examples/`. The simplest example is:

```html
<!DOCTYPE html>
<html lang="en">
 <head>
  <meta charset="UTF-8">
  <title>The simplest example</title>
  <script src="/dist/mojeid_connect.2.0.0.js" id="mojeid-connect-script"
    data-jsrsasign="/node_modules/jsrsasign/lib/jsrsasign-all-min.js"></script>
  <script>
    mojeID = mojeid_connect.createMojeidConnect({
      clientName: "The simplest example",
      runRegisterInsideListener: 'DOMContentLoaded',
      claims: [
          'family_name',
          'given_name',
          'nickname',
          'email',
          'phone_number',
          'address',
          'birthdate',
          'gender',
          'website',
          'profile'
      ]
    });
  </script>
 </head>
 <body>
  <h1>The simplest</h1>
  <form>
   <div><label>Name:</label><input type="text" id="given_name"/></div>
   <div><label>Family name:</label><input type="text" id="family_name"/></div>
   <div><label>Phone:</label><input type="text" id="phone_number"/></div>
   <div><label>Email:</label><input type="text" id="email"/></div>
   <div><label>Address:</label><textarea cols="25" rows="5" id="address"></textarea></div>
   <div><label>Birth date:</label><input type="text" id="birthdate"/></div>
   <div><label>Gender:</label><input type="text" id="gender"/></div>
   <div><label>Nickname:</label><input type="text" id="nickname"/></div>
   <div><label>Website:</label><input type="text" id="website"/></div>
   <div><label>Personal profile:</label><input type="text" id="profile"/></div>
  </form>
  <div class="button-frame">
      <button id="button-prefill" onclick="mojeID.requestAuthentication()">Pre-fill by mojeID</button>
  </div>
 </body>
</html>
```

----

## Testing directly from the git project

Download the project:

```
git clone https://github.com/CZ-NIC/mojeid-connect-js.git
```

Install `npm` environment:

```
npm install
```

Run tests:

```
npm run test
```

Run code coverage:

```
npm run test-coverage
```

Compile the library. Files are compiled into the `./dist` folder.

```
npm run build
```

Create certificate as it is described in [Create self signed SSL certificate](#create-self-signed-ssl-certificate). Create symlinks to the distributed library and node modules (only once) and run server:

```
ln -s ../node_modules examples/node_modules
ln -s ../dist examples/dist

node_modules/http-server/bin/http-server ./examples/ --ssl --cert cert.pem --key key.pem -p 8000
```

----

Written by: Zdeněk Böhm, 26. 9. 2019
