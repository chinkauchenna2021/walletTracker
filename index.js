const express = require("express")
// Import Moralis
const Moralis = require("moralis").default;
// Import the EvmChain dataType
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const cors = require("cors")
require('dotenv').config()
const app = express()
const PORT = process.env.PORT | 8080
// Add a variable for the api key, address and chain
const MORALIS_API_KEY = "replace_me";
const address = "replace_me";
// const chain = EvmChain.ETHEREUM;

const chains = [EvmChain.ETHEREUM, EvmChain.BSC, EvmChain.POLYGON];
const ethereumChain = EvmChain.ETHEREUM;
const bscChain = EvmChain.BSC;
const polygonChain = EvmChain.POLYGON;

app.use(cors("*"));
app.use(express.json())
 
app.get('/',(req,res)=>{

  res.status(200).json({message:"server started successfully"})
})

const data = [];
app.post('/getuserdata', async(req, res)=>{

    try{
        const {address} = req.body;
      const  ethBalance =  await getTokenBalance(ethereumChain , address);
      const  bscBalance =  await getTokenBalance(bscChain , address);
      const  polygonBalance =  await getTokenBalance(polygonChain , address);
        const walletActivityResponse = await Moralis.EvmApi.wallets.getWalletActiveChains({
            address,
            chains,
          });

     const decoded =  await Promise.all(walletActivityResponse.toJSON().active_chains.map(async(items, index)=>{
           return await decodeTxn(chains[index] , items.first_transaction.transaction_hash)
        }))
 res.json({message:"data received" ,tokenBalance:{ethBalance ,bscBalance , polygonBalance} ,  response: walletActivityResponse.toJSON() , decodedTxn:decoded})       
    }catch(err){
      res.json({message:"error" , err})
    }
})


async function decodeTxn(chain , trnHash){
    try{
    const tnxDecode = await Moralis.EvmApi.transaction.getTransactionVerbose({
        "chain": chain,
        "transactionHash":trnHash
      });
     return tnxDecode;
    } catch (e) {
      console.error(e);
    }
}





async function getTokenBalance(chain , address){
    try{
        const walletEthToken = await Moralis.EvmApi.balance.getNativeBalance({
            address,
            chain,
          });
       return walletEthToken;
    }catch(err){
        console.log("error ", err);
    }
} 

const startServer = async () => {
    await Moralis.start({
      apiKey: String(process.env.MORALIS_KEY),
    });
}

app.listen(PORT , ()=>console.log(`server started on port ${PORT} `))
startServer()
