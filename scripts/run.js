const main = async () => {

    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("Ve");
    await domainContract.deployed();

    console.log("Contract deployed to:", domainContract.address); 
    

    let transaction = await domainContract.registerAddress("itworks", {value:hre.ethers.utils.parseEther('0.1')});
    await transaction.wait();

    const address = await domainContract.getAddress("itworks");
    console.log("Owner of domain itworks: ", address);

    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance: ", hre.ethers.utils.formatEther(balance));

};

const runMain = async () => {
    try{
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
};

runMain();