const { ethers } = require("hardhat")

async function deployFight(address1, address2, nftID1, nftID2) {
    
    // Hardcoded for testing execution
    // address1 = (await ethers.getSigners())[0].address
    // address2 = (await ethers.getSigners())[1].address
    // nftID1 = 1
    // nftID2 = 2

    console.log(address1)
    console.log(address2)
    const FightFactory = await ethers.getContractFactory("Fight")
    const FightContract = await FightFactory.deploy(address1, address2, nftID1, nftID2)
    await FightContract.deployed()

    return FightContract;
}

deployFight().then(function () {
    process.exitCode = 0
}).catch((error) => {
    console.log(error)
    process.exitCode = 1
})

module.exports = {
    deployFight: deployFight,
}
