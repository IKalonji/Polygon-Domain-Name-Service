import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from 'ethers';
import contractAbi from './utils/contractABI.json'

// Constants
const TWITTER_HANDLE = 'ISSDawg';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const tld = '.Polygon';
const CONTRACT_ADDRESS = "0x8b8F107b84eF7300Ee312cc8979aD53b043d6f9B";

const App = () => {

	const [currentAccount, setCurrentAccount] = useState('');

	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');

	const connectWallet = async () => {
		try {
			const {ethereum} = window;

			if (!ethereum){
				alert("Get Metamask -> https://metamask.io/");
				return;
			}

			const accounts = await ethereum.request({method: 'eth_requestAccounts'});

			console.log("Connected", accounts[0]);
      		setCurrentAccount(accounts[0]);	
		} catch (error) {
			console.log(error);
		}
	}

	const checkIfWalletIsConnected = async () => {

		const {ethereum} = window;

		if (!ethereum){
			console.log("Make sure you have Metamask");
			return;
		} else {
			console.log("We have an Ethereum object ", ethereum);
		}

		const accounts = await ethereum.request({method: 'eth_accounts'});

		if (accounts.length !== 0){
			const account = accounts[0];
			console.log('Found an authorized account: ', account);
			setCurrentAccount(account);
		}else {
			console.log('No authorized account found');
		}
	};

	const mintDomain = async () => {
		if (!domain) {return;}
		if (domain.length < 3) {
			alert("Domain must be at least 3 characters long.")
			return;
		}

		const price = domain.length ===3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';

		console.log("Minting domain", domain, "with price");

		try {
			const { ethereum } = window;
			if (ethereum){
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer)

				console.log("Going to pop up now to pay gas...");

				let tx = await contract.registerAddress(domain, {value:ethers.utils.parseEther(price)});

				const receipt = await tx.wait();

				if (receipt.status === 1) {
					console.log("Domain minted https://mumbai.polygonscan.com/tx/"+tx.hash)

					tx = await contract.setRecord(domain, record);
					await tx.wait();

					console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash)

					setRecord('');
					setDomain('');
				} else {
					alert("Transaction failed! Please try again");
				}
			}
		} catch (error){
			console.log(error);
		}
	}

	const renderNotConnectedContainer = () => (
		<div className='connect-wallet-container'>
			<img src='https://cryptologos.cc/logos/polygon-matic-logo.png?v=022' alt='Polygon logo'/>
			<button onClick={connectWallet} className='cta-button connect-wallet-button'>
				Connect Wallet
			</button>
		</div>
	);

	const renderInputForm = () => {
		return (
			<div className="form-container">
				<div className="first-row">
					<input 
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'>{tld}</p>
				</div>

				<input
					type="text"
					value={record}
					placeholder='Provide an alias'
					onChange={e => setRecord(e.target.value)} 
				/>

				<div className="button-container">
					<button className='cta-button mint-button' disabled={null} onClick={mintDomain}>
						Mint
					</button>
					{/* <button className='cta-button mint-button' disabled={null} onClick={null}>
						Set data
					</button> */}
				</div>
			</div>
		)
	}

	useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

	return (
			<div className="App">
				<div className="container">

					<div className="header-container">
						<header>
							<div className="left">
							<p className="title">.Polygon - Polygon Domain Name Service</p>
							<p className="subtitle">Polygon domains simplified!</p>
							</div>
						</header>
					</div>
				
					{!currentAccount && renderNotConnectedContainer()}

					{currentAccount && renderInputForm()}

					<div className="footer-container">
						<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
						<a
							className="footer-text"
							href={TWITTER_LINK}
							target="_blank"
							rel="noreferrer"
						>{`built by @${TWITTER_HANDLE}`}</a>
					</div>
				</div>
			</div>
	);
}

export default App;
