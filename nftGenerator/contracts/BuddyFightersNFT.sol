// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// For now attributes of NFT's are randomly given by your computer when runs
// the script of mint.js in the utils section => generate_NFT_image.js
//
// Future implementations will use ChainLink network sevices to:
// -Generate random stats for minted NFT's.
// -Fix NFT price to 50$.

error NftDoesntExist();
error MinimumPriceNotPayed();
error NameTooLong();
error NameTooShort();
error NftStatsAreNotInBlockchain();

contract BuddyFightersNFT is ERC721URIStorage {

    /* State variables */

    uint256 internal s_ntfCounter = 0;
    mapping (uint256 => string) s_nftIdToURI;
    mapping (uint256 => nftTraits) s_nftIdToAttributes;

    uint8 constant TRAITS_NUM = 7;
    uint256 constant MINIMUM_MINT_PRICE = 10000000000000000;
    uint256 constant MINIMUM_STATS_CHANGE_PRICE = 10000000000000;
    uint8 constant MAX_STATS_VALUE = 255;


    /* Type declarations */

    struct nftTraits {

        // Add SVG image value for the NFT image representation (may add outside attributes???)
        string name;

        // [0] -> hp; [1] -> attck; [2] -> spclAttck; 
        // [3] -> def; [4] -> spclDef; [5] -> vel;
        uint8[TRAITS_NUM - 1] stats;
    }

    
    /* Events */

    event NFTminted(address indexed owner, string indexed tokenURI, uint256 indexed tokenId);


    /* Modifiers */

   // Checks if an NFT's ID has already been created.
    modifier nftDoesntExist(uint256 _nftID) {
        if(_nftID > s_ntfCounter) {revert NftDoesntExist(); }
        _;
    }


    /* Functions */

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}


    /*
        Mints NFT.

        _onBlockhain == True: NFT's attributes will be stored on the blockchain which
        results in a higher price of minting.

        _onBlockchain == False: NFT's attributes will be stored in an IPFS network 
        URI which results in cheaper minting price.
    */
    function mintNFT(string memory _tokenURI, string memory _name, bool _onBlockhain) public payable
                                    returns(nftTraits memory) {
        if(msg.value < MINIMUM_MINT_PRICE) { revert  MinimumPriceNotPayed(); }
        if(bytes(_name).length > 30) { revert NameTooLong(); }
        if(bytes(_name).length < 1) { revert NameTooShort(); }

        nftTraits memory stats = generateRandomStats(_name);
        _safeMint(msg.sender, s_ntfCounter);
        _setTokenURI(s_ntfCounter, _tokenURI);

        if(_onBlockhain)
            s_nftIdToAttributes[s_ntfCounter] = stats;
        s_nftIdToURI[s_ntfCounter] = _tokenURI;

        emit NFTminted(msg.sender,  _tokenURI, s_ntfCounter);
        s_ntfCounter += 1;
        return stats;
    }   

    //TODO
    function improveStat(uint256 _nftID, uint256 _attribute, uint8 _quantity) public payable {
        if(msg.value < MINIMUM_STATS_CHANGE_PRICE) { revert MinimumPriceNotPayed(); }

        if((s_nftIdToAttributes[_nftID].stats[_attribute] + _quantity) > 255){
            s_nftIdToAttributes[_nftID].stats[_attribute] = 255;
        }else {
            s_nftIdToAttributes[_nftID].stats[_attribute] += _quantity;
        }
    }


   // Stores an already minted NFT attributes to the blockchain.
    function storeStatsInBlockchain(uint256 _nftID, nftTraits memory _nftTraits) public nftDoesntExist(_nftID) {
        s_nftIdToAttributes[_nftID] = _nftTraits;
    }


    // Returns stats of NFT whose stats are stored in the blockchain.
    function getStats(uint256 _nftID) public view nftDoesntExist(_nftID) returns(nftTraits memory) {
        if(bytes(s_nftIdToAttributes[_nftID].name).length != 0) { revert NftStatsAreNotInBlockchain(); }
        return s_nftIdToAttributes[_nftID];
    }


    function getLastNFTId() public view returns(uint256) {
        return s_ntfCounter;
    }

    //TODO
    // This function will call ChainLink functions to generate random values.
    function generateRandomStats(string memory nameOfNft) private returns(nftTraits memory) {
        // uint8[TRAITS_NUM - 1] memory rndmStats = [255, 255, 255, 255, 255, 255]; 
        uint8[TRAITS_NUM - 1] memory rndmStats = [255, 255, 255, 255, 255, 255];
        nftTraits memory stats = nftTraits(nameOfNft, rndmStats);
        return stats;
    }   
}
