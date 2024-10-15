// Loading saved player names from Local Storage
let playerNames = [];
let numParticipants = 2;

// Function to save data to Local Storage
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Function to get data from Local Storage
function getFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

// Show the modal for adding a new player
document.getElementById('addPlayerBtn').addEventListener('click', function() {
    document.getElementById('playerNameInput').value = ''; // Clear the input field
    document.getElementById('playerModal').style.display = 'block';
    document.getElementById('playerNameInput').focus();
});

// Handle OK and Cancel buttons
document.getElementById('okPlayerBtn').addEventListener('click', addPlayer);
document.getElementById('cancelPlayerBtn').addEventListener('click', closeModal);

// Event listeners for Enter and Escape keys in the modal
document.getElementById('playerModal').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') addPlayer();
    if (event.key === 'Escape') closeModal();
});

// Event listener for the "Enter" key to trigger calculation
document.addEventListener('keydown', function(event) {
    // Check if the Enter key is pressed and not in the player name input
    if (event.key === 'Enter' && document.activeElement.id !== 'playerNameInput') {
        calculate(); // Call the calculate function
    }
});

// Add a player and update the participant list
function addPlayer() {
    const playerName = document.getElementById('playerNameInput').value.trim();
    if (playerName && !playerNames.includes(playerName)) {
        playerNames.push(playerName);
        saveToLocalStorage('players', playerNames);
        updateParticipantList();
    }
    closeModal();
}

function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
}

// Populate the number of participants dropdown
const numParticipantsSelect = document.getElementById('numParticipants');
for (let i = 2; i <= 40; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    numParticipantsSelect.appendChild(option);
}

const lastNumParticipants = getFromLocalStorage('numParticipants');
numParticipantsSelect.value = lastNumParticipants || 2;
numParticipants = parseInt(numParticipantsSelect.value);

numParticipantsSelect.addEventListener('change', function() {
    numParticipants = parseInt(this.value);
    saveToLocalStorage('numParticipants', numParticipants);
    updateParticipantList();
});

updateParticipantList();

// Function to update the participant list
function updateParticipantList() {
    const participantsDiv = document.getElementById('participantsList');

    // Get current data from the rows to preserve
    const currentData = Array.from(participantsDiv.children).map(row => {
        const playerSelect = row.querySelector('.playerSelect').value;
        const balanceValue = row.querySelector('.balanceValue').value;
        return { playerSelect, balanceValue };
    });

    // Adjust the number of rows, keeping existing data
    const existingRows = participantsDiv.children.length;

    // Add rows if needed
    for (let i = existingRows; i < numParticipants; i++) {
        const playerRow = document.createElement('div');
        playerRow.innerHTML = `
            <select class="playerSelect">
                <option value="">Select name</option>
                ${playerNames.map(name => `<option value="${name}">${name}</option>`).join('')}
            </select>
            <input type="number" placeholder="Balance" class="balanceValue">
            <span class="debtInfo" style="margin-left: 10px; font-weight: normal; color: gray;"></span>
        `;
        participantsDiv.appendChild(playerRow);
    }

    // Remove rows if too many
    while (participantsDiv.children.length > numParticipants) {
        participantsDiv.removeChild(participantsDiv.lastChild);
    }

    // Restore existing data to the current rows
    for (let i = 0; i < Math.min(currentData.length, numParticipants); i++) {
        const row = participantsDiv.children[i];
        row.querySelector('.playerSelect').value = currentData[i].playerSelect;
        row.querySelector('.balanceValue').value = currentData[i].balanceValue;
    }

    // Add change event listeners to update available player options and Calc button state
    Array.from(document.querySelectorAll('.playerSelect')).forEach(select => {
        select.addEventListener('change', function() {
            updateAvailablePlayers(); // Update options to prevent duplicate selection
            checkCalcButtonState();   // Recheck if all participants are selected
        });
    });

    updateAvailablePlayers(); // Initial check for available players
    checkCalcButtonState();   // Initial check for enabling Calc button
}

// Prevent duplicate player names across selects
function updateAvailablePlayers() {
    const selectedNames = Array.from(document.querySelectorAll('.playerSelect')).map(select => select.value);
    Array.from(document.querySelectorAll('.playerSelect')).forEach(select => {
        const currentValue = select.value;
        const availablePlayerNames = playerNames.filter(name => !selectedNames.includes(name) || name === currentValue);
        select.innerHTML = `
            <option value="">Select name</option>
            ${availablePlayerNames.map(name => 
                `<option value="${name}" ${name === currentValue ? 'selected' : ''}>${name}</option>`
            ).join('')}
        `;
    });
}

// Enable the Calculate button when all players are selected
function checkCalcButtonState() {
    const allSelected = Array.from(document.querySelectorAll('.playerSelect')).every(select => select.value !== "");
    document.getElementById('calcBtn').disabled = !allSelected;
}

// Load saved player names and update the list
const savedPlayers = getFromLocalStorage('players');
if (savedPlayers) {
    playerNames = savedPlayers;
    updateParticipantList();
}

// Calculate and display balances
function calculate() {
    const participants = Array.from(document.querySelectorAll('.playerSelect'));
    const balanceValues = Array.from(document.querySelectorAll('.balanceValue'));
    const balances = {};

    participants.forEach((select, index) => {
        const name = select.value;
        const balanceValue = parseFloat(balanceValues[index].value) || 0;
        if (name) {
            balances[name] = balanceValue;
        }
    });

    // Calculate total sum of balances
    const totalSum = Object.values(balances).reduce((sum, value) => sum + value, 0);

    // Display message based on the sum of balances
    const resultsDiv = document.getElementById('results');
    if (totalSum > 0) {
        resultsDiv.innerHTML = `It seems that ${totalSum} are missing.`;
        return;
    } else if (totalSum < 0) {
        resultsDiv.innerHTML = `It seems that there are extra ${-totalSum}.`;
        return;
    } else {
        resultsDiv.innerHTML = 'Balances are equal, no missing or extra amount.';
    }

    // Clear previous debt info
    participants.forEach(select => {
        const row = select.parentElement;
        const debtInfoElement = row.querySelector('.debtInfo');
        debtInfoElement.innerHTML = ''; // Clear previous debts
    });

    // Function to find player owing the most and owed the most
    function findMaxOwersAndCreditors() {
        const creditor = Object.keys(balances).reduce((max, player) =>
            balances[player] > 0 && (max === null || balances[player] > balances[max]) ? player : max, null);
        const debtor = Object.keys(balances).reduce((max, player) =>
            balances[player] < 0 && (max === null || balances[player] < balances[max]) ? player : max, null);
        return { creditor, debtor };
    }

    // Settle debts iteratively
    let totalSettled = true;
    while (true) {
        const { creditor, debtor } = findMaxOwersAndCreditors();

        if (!creditor || !debtor) {
            break; // No more debts to settle
        }

        const amountToSettle = Math.min(balances[creditor], -balances[debtor]);

        // Update balances
        balances[creditor] -= amountToSettle;
        balances[debtor] += amountToSettle;

        // Update debt info in the UI
        const debtorRow = participants.find((select) => select.value === debtor).parentElement;
        debtorRow.querySelector('.debtInfo').innerHTML += `${amountToSettle} --> ${creditor}, `;

        totalSettled = false;
    }

    // clean ', ' from end of lines
    participants.forEach(select => {
        const row = select.parentElement;
        const debtInfoElement = row.querySelector('.debtInfo');
        if (debtInfoElement.innerHTML.endsWith(', ')) {
            debtInfoElement.innerHTML = debtInfoElement.innerHTML.slice(0, -2); // Remove last comma and space
        }
    });
}

document.getElementById('calcBtn').addEventListener('click', calculate);
