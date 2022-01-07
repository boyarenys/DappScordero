import Web3 from "web3";
import AmongAllArtifact from "../../build/contracts/AmongAll.json";

const App = {
  web3: null,
  account: null,
  amongAll: null,
  transaction: null,
  balanceAccount: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AmongAllArtifact.networks[networkId];
      this.amongAll = new web3.eth.Contract(
        AmongAllArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      
      //Obtener saldo cuenta seleccionada
      var balanceAccount =  await web3.eth.getBalance(this.account);
      this.balanceAccount = balanceAccount;

      //Obtener último hash 
      var lastTransaction = await web3.eth.getBlockNumber();
     // console.log(lastTransaction);

      //Obtener blockhash
      var blockHash = await web3.eth.getBlock(lastTransaction);
      //console.log(blockHash.transactions);

      //Obtener bloque de ultima transaccion
      var transactionReceipt = await web3.eth.getTransactionReceipt(blockHash.transactions[0]);
     //console.log(transactionReceipt.blockHash);
      this.transaction = transactionReceipt.blockHash;

      // Functions
      this.render();
      this.getTotalBalance();
      this.getTotalUsers();
      this.getTotalClaims();
      
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  render: async function() {
    document.getElementById('account').innerText = this.account;
    document.getElementById('transaction').innerText = this.transaction;
    document.getElementById('balanceAddress').innerText = this.balanceAccount;    
  },

  register: async function() {
    const msg = "Se ha registrado el valor del movil";
    const mobile_price = document.getElementById("register_mobile_price").value;
    const aux = mobile_price / 10;
    const address = this.amongAll.options.address;

    const { register } = this.amongAll.methods;
    await register(mobile_price).send({ from: this.account, to:address, value:aux });
    document.getElementById("result_register").innerText = msg;   
    
    //Transaction
    /*const receipt  = await web3.eth.getTransactionReceipt(tr1);
    console.log (receipt);  */ 
    
  },

  acceptClaim: async function() {
    const msg = "Reclamación ok."
    const address = document.getElementById("address_accept_claim").value;
    const { acceptClaim } = this.amongAll.methods;
    await acceptClaim(address).send({ from: this.account });
    document.getElementById("result_acceptClaim").innerText = msg;  
  },

  createClaim: async function() {
    const msg = "Reclamación creada."
    const claimSelected = document.getElementById("claimSelected").value;
    const { createClaim } = this.amongAll.methods;
    const claim = await createClaim(claimSelected).send({ from: this.account });
    document.getElementById("result_createClaim").innerText = msg; 
  },

  getClaimStatus: async function() {
    const address = document.getElementById("address_claim_status").value;
    const { getClaimStatus } = this.amongAll.methods;
    const claimStatus = await getClaimStatus(address).call();
    document.getElementById("result_claim_status").innerText = claimStatus;    
  },

  getMobilePrice: async function() {
    const address_mobile_price = document.getElementById("address_mobile_price").value; 
    const { getMobilePrice } = this.amongAll.methods;
    if(address_mobile_price != ''){
      const result = await getMobilePrice(address_mobile_price).call()
      document.getElementById("result_mobile_price").innerText = result;    
    }    
  },

  executeClaim: async function() {
    const msg = "Correcta";
    const { executeClaim } = this.amongAll.methods;
    await executeClaim().send({ from: this.account });
    document.getElementById("result_executeClaim").innerText = msg;    
  },
  
  // GETS information
  getTotalBalance: async function() {  
    const { getTotalBalance } = this.amongAll.methods;
    const balance = await getTotalBalance().call();
    document.getElementById('balance').innerText = balance;
  },

  getTotalClaims: async function() {  
    const { getTotalClaims } = this.amongAll.methods;
    const claims = await getTotalClaims().call();
    document.getElementById('totalClaims').innerText = claims;    
  },

  getTotalUsers: async function() {  
    const { getTotalUsers } = this.amongAll.methods;
    const user = await getTotalUsers().call();
    document.getElementById('totalUsers').innerText = user;
  },

  
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
