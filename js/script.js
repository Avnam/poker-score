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

// Function to show the modal for adding a new player
document.getElementById('addPlayerBtn').addEventListener('click', function() {
    document.getElementById('playerNameInput').value = ''; // Clear the input field
    document.getElementById('playerModal').style.display = 'block';

    // Set focus on the input field
    document.getElementById('playerNameInput').focus();
});

// Handle OK button for adding a player
document.getElementById('okPlayerBtn').addEventListener('click', function() {
    addPlayer();
});

// Handle Cancel button
document.getElementById('cancelPlayerBtn').addEventListener('click', function() {
    closeModal();
});

// Add event listeners for Enter and Escape keys
document.getElementById('playerModal').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        addPlayer();  // Same as pressing OK
    } else if (event.key === 'Escape') {
        closeModal(); // Same as pressing Cancel
    }
});

// Function to add a player
function addPlayer() {
    const playerName = document.getElementById('playerNameInput').value.trim();
    if (playerName && !playerNames.includes(playerName)) {
        playerNames.push(playerName);
        saveToLocalStorage('players', playerNames); // Save player names to Local Storage
        updateParticipantList();
    }
    closeModal();
}

// Function to close the modal
function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
}

// Populate participant selection dropdown
const numParticipantsSelect = document.getElementById('numParticipants');
for (let i = 2; i <= 40; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    numParticipantsSelect.appendChild(option);
}

// Set the default or saved number of participants
const lastNumParticipants = getFromLocalStorage('numParticipants');
if (lastNumParticipants) {
    numParticipantsSelect.value = lastNumParticipants;
    numParticipants = parseInt(lastNumParticipants);
} else {
    numParticipantsSelect.value = 2;
}

numParticipantsSelect.addEventListener('change', function() {
    numParticipants = parseInt(this.value);
    saveToLocalStorage('numParticipants', numParticipants); // Save to Local Storage
    updateParticipantList();
});

updateParticipantList();

// Function to update the participant list
function updateParticipantList() {
    const participantsDiv = document.getElementById('participantsList');

    // Get current data from the rows to preserve
    const currentData = Array.from(participantsDiv.children).map(row => {
        const playerSelect = row.querySelector('.playerSelect').value;
        const inValue = row.querySelector('.inValue').value;
        const outValue = row.querySelector('.outValue').value;
        return { playerSelect, inValue, outValue };
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
            <input type="number" placeholder="In" class="inValue">
            <input type="number" placeholder="Out" class="outValue">
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
        row.querySelector('.inValue').value = currentData[i].inValue;
        row.querySelector('.outValue').value = currentData[i].outValue;
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

// Function to update available player names (no duplicates across selects)
function updateAvailablePlayers() {
    const selectedNames = Array.from(document.querySelectorAll('.playerSelect')).map(select => select.value);

    // Update each select element's options
    Array.from(document.querySelectorAll('.playerSelect')).forEach(select => {
        const currentValue = select.value;

        // Filter available names to exclude names already selected in other selects
        const availablePlayerNames = playerNames.filter(name => 
            !selectedNames.includes(name) || name === currentValue
        );

        // Rebuild the options for this select element
        select.innerHTML = `
            <option value="">Select name</option>
            ${availablePlayerNames.map(name => 
                `<option value="${name}" ${name === currentValue ? 'selected' : ''}>${name}</option>`
            ).join('')}
        `;
    });
}

// Check if the Calculate button can be enabled
function checkCalcButtonState() {
    const allSelected = Array.from(document.querySelectorAll('.playerSelect')).every(select => select.value !== "");
    document.getElementById('calcBtn').disabled = !allSelected;
}

// Load saved player names from Local Storage
const savedPlayers = getFromLocalStorage('players');
if (savedPlayers) {
    playerNames = savedPlayers;
    updateParticipantList();
}


// Function to calculate debts and display results
function calculate() {
    const participants = Array.from(document.querySelectorAll('.playerSelect'));
    const inValues = Array.from(document.querySelectorAll('.inValue'));
    const outValues = Array.from(document.querySelectorAll('.outValue'));

    const totalIn = {};
    const totalOut = {};

    // Initialize totals for each participant
    participants.forEach((select, index) => {
        const name = select.value;
        const inValue = parseFloat(inValues[index].value) || 0;
        const outValue = parseFloat(outValues[index].value) || 0;

        if (name) {
            totalIn[name] = (totalIn[name] || 0) + inValue;
            totalOut[name] = (totalOut[name] || 0) + outValue;
        }
    });

    // Calculate net balances
    const balances = {};
    for (const name of Object.keys(totalIn)) {
        balances[name] = (totalOut[name] || 0) - (totalIn[name] || 0);
    }

    // Clear previous debts from lines at the start
    participants.forEach((select) => {
            const row = select.parentElement;
            const debtInfoElement = row.querySelector('.debtInfo');
            debtInfoElement.innerHTML = ''; // Clear previous debts
        });

    // Clear previous debts from lines at the start
    participants.forEach((select) => {
        const row = select.parentElement;
        const debtInfoElement = row.querySelector('.debtInfo');
        debtInfoElement.innerHTML = ''; // Clear previous debts
    });

    // Determine who owes whom
    const positiveBalances = Object.keys(balances).filter(name => balances[name] > 0);
    const negativeBalances = Object.keys(balances).filter(name => balances[name] < 0);

    positiveBalances.forEach(creditor => {
        const amountOwed = balances[creditor];
        negativeBalances.forEach(debtor => {
            const amountToPay = Math.min(-balances[debtor], amountOwed);
            if (amountToPay > 0) {
                // Update the original participant line with debt information
                const debtorRow = participants.find((select) => select.value === debtor).parentElement;
                debtorRow.querySelector('.debtInfo').innerHTML += `${amountToPay} --> ${creditor}, `;

                // debts.push(`${debtor} owes ${creditor} ${amountToPay}`);
                balances[creditor] -= amountToPay;
                balances[debtor] += amountToPay;
            }
        });
    });

    // Clear the trailing comma and space
    participants.forEach((select) => {
        const row = select.parentElement;
        const debtInfoElement = row.querySelector('.debtInfo');
        if (debtInfoElement.innerHTML.endsWith(', ')) {
            debtInfoElement.innerHTML = debtInfoElement.innerHTML.slice(0, -2); // Remove last comma and space
        }
    });

    // If no debts are found, notify
    if (debts.length === 0) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = 'No debts to settle.';
    }
}

// Attach the calculate function to the Calc button
document.getElementById('calcBtn').addEventListener('click', calculate);