// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;


import "hardhat/console.sol";
import { StringUtils } from "./libraries/StringUtils.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {Base64} from "./libraries/Base64.sol";

contract Domains is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string public topLevelDomain;

    string svgPartOne = '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#B)" d="M0 0h270v270H0z"/><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><defs><linearGradient id="B" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#cb5eee"/><stop offset="1" stop-color="#0cd7e4" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#fff" filter="url(#A)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,Apple Color Emoji,sans-serif" font-weight="bold">';
    string svgPartTwo = '</text></svg>';

    mapping(string => address) public domains;
    mapping(string => string) public records;

    constructor(string memory _topLevelDomain) payable ERC721("Polygon Domain Name Service", "PolyDNS"){
        topLevelDomain = _topLevelDomain;
        console.log("%s name service deployed", _topLevelDomain);
    }

    function price(string calldata name) public pure returns(uint) {
        uint len = StringUtils.strlen(name);
        require(len > 0);
        if (len == 3){
            return 5 * 10**17;
        } else if (len == 4){
            return 3 * 10**17;
        } else {
            return 1 * 10**17;
        }
    }

    function registerAddress(string calldata name) public payable{
        require(domains[name] == address(0));

        uint _price = price(name);

        require(msg.value >= _price, "Not enough matic");

        string memory _name = string(abi.encodePacked(name, ".", topLevelDomain));
        string memory finalSVG = string(abi.encodePacked(svgPartOne, _name, svgPartTwo));

        uint256 newRecordId = _tokenIds.current();
        uint256 length = StringUtils.strlen(name);
        string memory strLen = Strings.toString(length);

        console.log("Registering %s.%s on the contract with tokenID %d", name, topLevelDomain, newRecordId);

        string memory json = Base64.encode(
            abi.encodePacked(
            '{"name": "',
                _name,
            '", "description": "A domain on the Ninja name service", "image": "data:image/svg+xml;base64,',
                 Base64.encode(bytes(finalSVG)),
                '","length":"',
                strLen,
            '"}'
            )
        );

        string memory finalTokenUri = string(abi.encodePacked("data:application/json;base64,",json));

        console.log("\n-------------------------------------------------------");
        console.log("Final tokeURI", finalTokenUri);
        console.log("---------------------------------------------------------");

        _safeMint(msg.sender, newRecordId);
        _setTokenURI(newRecordId, finalTokenUri);
        domains[name] = msg.sender;
        _tokenIds.increment();
        console.log("%s has registered a domain!", msg.sender);
    }

    function getAddress(string calldata name) public view returns(address){
        return domains[name];
    }

    function setRecord(string calldata name, string calldata record) public {
        require(domains[name] == msg.sender);
        records[name] = record;
    }

    function getRecord(string calldata name) public view returns(string memory){
        return records[name];
    }
}