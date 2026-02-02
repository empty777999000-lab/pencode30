/**
 * INFINITY VAULT CORE ENGINE
 * Contract: 0x368E6e2eb54D0c4F0bdC79381343A92BE3A193dE
 */

const CONTRACT_ADDRESS = "0x368E6e2eb54D0c4F0bdC79381343A92BE3A193dE";
const ABI = [
    { "inputs": [], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "users", "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "lastUpdate", "type": "uint256" }, { "internalType": "uint256", "name": "reward", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

let provider, signer, contract;
let currentAccount = null;

// --- ১. ওয়ালেট কানেক্ট ফাংশন ---
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // কানেক্টিং স্টেট দেখানো
            document.getElementById('connectBtn').innerText = "CONNECTING...";
            
            // ওয়ালেট রিকোয়েস্ট
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            
            // ইথারস সেটআপ
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            // UI আপডেট
            updateUI();
            fetchStakedData();
            
            log("Wallet Connected Successfully", "success");
        } catch (error) {
            console.error(error);
            log("Connection Rejected", "error");
            document.getElementById('connectBtn').innerText = "CONNECT WALLET";
        }
    } else {
        alert("Please install MetaMask or use Trust Wallet browser!");
        log("No Wallet Provider Found", "error");
    }
}

// --- ২. স্টেক করা ডাটা ফেচ করা ---
async function fetchStakedData() {
    if (!contract || !currentAccount) return;
    try {
        const userData = await contract.users(currentAccount);
        // ১০^১৮ দিয়ে ভাগ করে রিডযোগ্য ফরম্যাটে আনা
        const stakedAmount = ethers.utils.formatUnits(userData.amount, 18);
        document.getElementById('stakedBal').innerText = parseFloat(stakedAmount).toFixed(4);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

// --- ৩. স্টেক (Execute Protocol) ফাংশন ---
async function initiateStake() {
    if (!currentAccount) return alert("Please connect wallet first!");
    
    const amount = document.getElementById('stakeAmount').value;
    if (!amount || amount <= 0) return alert("Enter a valid amount!");

    try {
        const txAmount = ethers.utils.parseUnits(amount.toString(), 18);
        log("Transaction Pending...", "info");
        
        const tx = await contract.stake(txAmount);
        document.getElementById('executeBtn').innerText = "PROCESSING...";
        
        await tx.wait();
        log("Stake Successful!", "success");
        document.getElementById('executeBtn').innerText = "EXECUTE PROTOCOL";
        fetchStakedData();
    } catch (err) {
        console.error(err);
        log("Transaction Failed", "error");
        document.getElementById('executeBtn').innerText = "EXECUTE PROTOCOL";
    }
}

// --- হেল্পার ফাংশনস ---
function updateUI() {
    const btn = document.getElementById('connectBtn');
    btn.innerText = currentAccount.slice(0, 6) + "..." + currentAccount.slice(-4);
    btn.style.borderColor = "#00f2ff";
}

function log(msg, type) {
    const ledger = document.getElementById('ledger');
    const p = document.createElement('p');
    p.style.color = type === 'error' ? '#ff4d4d' : '#00f2ff';
    p.innerText = `> ${msg}`;
    ledger.prepend(p);
}

// ইভেন্ট লিসেনার
document.getElementById('connectBtn').addEventListener('click', connectWallet);
document.getElementById('executeBtn').addEventListener('click', initiateStake);
