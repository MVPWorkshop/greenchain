![logo](https://raw.githubusercontent.com/MVPWorkshop/greenchain/master/public/logo-white.png)

# Greenchain

>  Technology that makes Circular Economy our safe future.

GREENCHAIN’s goal is to mitigate environmental threats and to foster economic growth by enabling implementation of the pragmatic circular economy modules through tight and transparent monitoring of the waste supply chain, considering it a valuable resource and providing all the concerned parties to interact in ways they could never before by opening the door to an exciting future.

Greenchain is technology that can provide accountability to waste supply chain, both from the waste generation side as well as from the waste treatment end. The design principle behind solution is to enable free ﬂow of waste and waste management information, aiming at removing current barriers to data interoperability, enabling transparency and access to respective information in real time, supporting such implementation of the circular economy concept.

## Greenchain
Greenchain PoC is a decentralized application based on the Ethereum, based on the work on [Trace project](https://github.com/maximevaillancourt/trace). It currently 
allows stakeholders to add waste management details to the app, as well as create certifications
that can be added to data. A mobile companion app 
allows scanning Greenchain QR codes placed on the actual products to see the data
on-premise (e.g. at the recycling factory).

Keep in mind that **this is not production ready by any means**.

Made using the Truffle toolkit, React.js, Redux, and Webpack.

## Screenshot

![scrot](https://user-images.githubusercontent.com/6010234/50397037-e49f8500-076d-11e9-94c7-3344c1684c41.png)
![scrot](https://user-images.githubusercontent.com/6010234/50397036-e49f8500-076d-11e9-8155-2e0469575d8d.png)

## Installing / Getting started

0. Clone the repo:

    ```shell
    git clone https://github.com/MVPWorkshop/greenchain.git
    cd greenchain
    ```
    
1. Install the Truffle toolkit globally and install project dependencies:

    ```shell
    npm install -g truffle && npm install
    ```

2. In a new shell, start the Truffle development console:

    ```shell
    truffle develop
    ```

3. In the Truffle console, compile and deploy the smart contracts:

    This will effectively reset your local blockchain, meaning that all existing transactions will be deleted.

    ```shell
    migrate --reset
    ```

4. Back in a regular shell, start the Webpack server:

    ```shell
    npm run start
    ```

    A browser window should then open automatically at `http://localhost:3000` (or whatever port you set manually). If you see the Greenchain home page, you're ready to go. Otherwise, if the page is stuck on "Waiting for Web3...", proceed to steps 5 and 6. 

5.  Install the [MetaMask browser extension](https://metamask.io/). Once installed, click on the MetaMask icon, then use the "Import Account" feature to create an account from a private key. Copy the first private key from the first few lines of output of `truffle develop` and paste it into the "Private Key" field in Metamask.

6.  Connect to your private network. Click the network chooser (it will likely say "Main Ethereum Network" at the top), and choose "Custom RPC". In there, enter the URL that matches the configuration in the `truffle.js` file (which should be `http://localhost:9545` by default), then click "Save".

7. Refresh the page in your browser, and you should be good to go!

## Developing

To change something in the "smart contracts" side of things, you need to compile your contracts every time you change them
using the following command in the Truffle console:

```shell
migrate --reset
```

As for the React front-end, the Webpack server should refresh the page in your browser automatically when a change is detected.

### Building

Once you're ready to bundle the front-end app, use the `build` script to bundle everything together.

```shell
npm run build
```

### Deploying

You're free to deploy the generated front-end bundle wherever you see fit. As for the smart contract, you can deploy it through Ganache/Truffle by adding a new network configuration. See [this guide](http://truffleframework.com/tutorials/deploying-to-the-live-network) for more information.

## Features

* Add a waste data to the platform
* Search for a particular waste
* Add certifications to data (e.g. "pet", etc.)
* Browse a product's version history
* See the product's previous positions on a map
* Combine products into one
* Split a product into many (WIP)

## Licensing

The code in this project is licensed under MIT license. See the [LICENSE](LICENSE).
