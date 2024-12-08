
// Constants and Data
const locations = [
    "Delhi Central",
    "New Delhi Railway Station",
    "Kashmere Gate",
    "Anand Vihar",
    "Sarai Kale Khan",
    "Dhaula Kuan"
];

const busCompanies = [
    { name: "Virgin Travels", type: "Volvo Multi-Axle Semi Sleeper (2+2)", rating: 4.4 },
    { name: "Acela", type: "Mercedes Benz Multi-Axle A/C Sleeper (2+1)", rating: 4.4 },
    { name: "Delhi Express", type: "Luxury A/C Sleeper (2+1)", rating: 4.2 },
    { name: "Capital Riders", type: "Non-A/C Seater (3+2)", rating: 3.9 }
];

// State Management
let currentSection = 'home';
let bookingState = {
    passengers: [],
    selectedSeats: [],
    contactDetails: {},
    busDetails: null,
    totalFare: 0
};

// Utility Functions
function generateRandomSchedule(date) {
    const schedule = [];
    for (let i = 0; i < 5; i++) {
        const company = busCompanies[Math.floor(Math.random() * busCompanies.length)];
        const departureHour = Math.floor(Math.random() * 24);
        const departureMinute = Math.floor(Math.random() * 60);
        const durationHours = 2 + Math.floor(Math.random() * 4);
        const durationMinutes = Math.floor(Math.random() * 60);
        const arrivalTime = new Date(date.getTime() + (durationHours * 60 + durationMinutes) * 60000);
        
        schedule.push({
            id: i + 1,
            company: company.name,
            type: company.type,
            rating: company.rating,
            departure: `${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`,
            arrival: `${String(arrivalTime.getHours()).padStart(2, '0')}:${String(arrivalTime.getMinutes()).padStart(2, '0')}`,
            duration: `${durationHours}h ${durationMinutes}m`,
            price: 40 + Math.floor(Math.random() * 60),
            seats: 1 + Math.floor(Math.random() * 40),
            totalSeats: 40,
            bookedSeats: Array.from({ length: Math.floor(Math.random() * 20) }, () => 
                Math.floor(Math.random() * 40) + 1
            )
        });
    }
    return schedule;
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    currentSection = sectionId;
}

function updateProgressBar(step) {
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        el.classList.toggle('active', index <= step);
    });
}

// Initialize Functions
function initializeApp() {
    populateLocationDropdowns();
    setDateInputLimits();
    attachEventListeners();
}

function populateLocationDropdowns() {
    const fromSelect = document.getElementById('fromLocation');
    const toSelect = document.getElementById('toLocation');

    locations.forEach(location => {
        fromSelect.innerHTML += `<option value="${location}">${location}</option>`;
        toSelect.innerHTML += `<option value="${location}">${location}</option>`;
    });
}

function setDateInputLimits() {
    const dateInput = document.getElementById('travelDate');
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);

    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    dateInput.value = today.toISOString().split('T')[0];
}

// Event Handlers
function attachEventListeners() {
    // Navigation
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            showSection(section);
        });
    });

    // Bus Search Form
    document.getElementById('busSearchForm').addEventListener('submit', handleBusSearch);

    // Passenger Management
    document.getElementById('addPassenger').addEventListener('click', addPassenger);
    document.getElementById('proceedToSeats').addEventListener('click', initializeSeatSelection);

    // Seat Selection
    document.getElementById('confirmSeats').addEventListener('click', handleSeatConfirmation);

    // Contact Details
    document.getElementById('proceedToPayment').addEventListener('click', handlePaymentRedirect);

    // Payment
    document.getElementById('payButton').addEventListener('click', handlePayment);

    // Ticket tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.ticket-list').forEach(list => {
                list.style.display = 'none';
            });
            document.getElementById(`${tabName}Tickets`).style.display = 'block';
        });
    });

    // Load active tickets by default
    loadTickets('active');
}

// Bus Search Handlers
function handleBusSearch(e) {
    e.preventDefault();
    const from = document.getElementById('fromLocation').value;
    const to = document.getElementById('toLocation').value;
    const date = document.getElementById('travelDate').value;

    if (from && to && date) {
        const schedules = generateRandomSchedule(new Date(date));
        displayBusSchedules(schedules, from, to);
    }
}

function displayBusSchedules(schedules, from, to) {
    const resultsDiv = document.getElementById('scheduleResults');
    let html = '<div class="bus-schedules">';
    
    schedules.forEach((bus, index) => {
        html += `
            <div class="bus-card" data-bus-id="${bus.id}">
                <div class="bus-header">
                    <div class="bus-company">
                        <div class="company-logo">
                            <i class="fas fa-bus"></i>
                        </div>
                        <div>
                            <div class="company-name">${bus.company}</div>
                            <div class="bus-type">${bus.type}</div>
                        </div>
                    </div>
                    ${index === 0 ? '<div class="bus-tag tag-cheapest">CHEAPEST</div>' : ''}
                    ${index === 1 ? '<div class="bus-tag tag-fastest">FASTEST</div>' : ''}
                </div>
                <div class="bus-details">
                    <div class="time-details">
                        <div class="departure-time">
                            <div class="time">${bus.departure}</div>
                            <div class="location">${from}</div>
                        </div>
                        <div class="duration">${bus.duration}</div>
                        <div class="arrival-time">
                            <div class="time">${bus.arrival}</div>
                            <div class="location">${to}</div>
                        </div>
                    </div>
                    <div class="price-rating">
                        <div class="price">₹${bus.price}</div>
                        <div class="rating">
                            <div class="stars">
                                <i class="fas fa-star"></i>
                                ${bus.rating}
                            </div>
                            <div class="seats">${bus.seats} seats left</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultsDiv.innerHTML = html;

    // Attach click handlers to bus cards
    document.querySelectorAll('.bus-card').forEach(card => {
        card.addEventListener('click', () => {
            const busId = card.dataset.busId;
            const selectedBus = schedules.find(bus => bus.id === parseInt(busId));
            bookingState.busDetails = selectedBus;
            showSection('booking');
            updateProgressBar(0);
        });
    });
}

// Passenger Management
function addPassenger() {
    const name = document.getElementById('passengerName').value;
    const age = document.getElementById('passengerAge').value;
    const gender = document.getElementById('passengerGender').value;

    if (name && age && gender) {
        if (bookingState.passengers.length < 6) {
            bookingState.passengers.push({ name, age, gender });
            updatePassengerList();
            document.getElementById('passengerName').value = '';
            document.getElementById('passengerAge').value = '';
            document.getElementById('passengerGender').value = '';
        } else {
            alert('Maximum 6 passengers allowed');
        }
    } else {
        alert('Please fill all passenger details');
    }
}

function updatePassengerList() {
    const list = document.getElementById('passengerList');
    list.innerHTML = bookingState.passengers.map((passenger, index) => `
        <div class="passenger-item">
            <div>
                <strong>Passenger ${index + 1}:</strong> 
                ${passenger.name} (${passenger.age}, ${passenger.gender})
            </div>
            <div>
                <button class="btn" onclick="editPassenger(${index})">Edit</button>
                <button class="btn" onclick="deletePassenger(${index})">Delete</button>
            </div>
        </div>
    `).join('');

    document.getElementById('proceedToSeats').disabled = bookingState.passengers.length === 0;
}

function editPassenger(index) {
    const passenger = bookingState.passengers[index];
    document.getElementById('passengerName').value = passenger.name;
    document.getElementById('passengerAge').value = passenger.age;
    document.getElementById('passengerGender').value = passenger.gender;
    bookingState.passengers.splice(index, 1);
    updatePassengerList();
}

function deletePassenger(index) {
    bookingState.passengers.splice(index, 1);
    updatePassengerList();
}

// Seat Selection
function initializeSeatSelection() {
    const upperDeck = document.getElementById('upperDeck');
    const lowerDeck = document.getElementById('lowerDeck');

    const generateDeck = (deckElement, startSeat, endSeat) => {
        deckElement.innerHTML = '';
        for (let i = startSeat; i <= endSeat; i++) {
            const isBooked = bookingState.busDetails.bookedSeats.includes(i);
            const isSelected = bookingState.selectedSeats.includes(i);
            deckElement.innerHTML += `
                <div class="seat ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}"
                     data-seat="${i}"
                     ${isBooked ? 'disabled' : ''}>
                    ${i}
                </div>
            `;
        }
    };

    generateDeck(upperDeck, 1, 20);
    generateDeck(lowerDeck, 21, 40);

    attachSeatClickHandlers();
    updateProgressBar(1);
}

function attachSeatClickHandlers() {
    document.querySelectorAll('.seat:not(.booked)').forEach(seat => {
        seat.addEventListener('click', () => {
            const seatNumber = parseInt(seat.dataset.seat);
            const maxSeats = bookingState.passengers.length;

            if (seat.classList.contains('selected')) {
                seat.classList.remove('selected');
                bookingState.selectedSeats = bookingState.selectedSeats.filter(s => s !== seatNumber);
            } else if (bookingState.selectedSeats.length < maxSeats) {
                seat.classList.add('selected');
                bookingState.selectedSeats.push(seatNumber);
            }

            updateSelectedSeats();
        });
    });
}

function updateSelectedSeats() {
    const selectedSeatsDiv = document.getElementById('selectedSeats');
    selectedSeatsDiv.innerHTML = `
        <div class="selected-seats-list">
            <h4>Selected Seats:</h4>
            ${bookingState.selectedSeats.map(seat => `
                <span class="selected-seat">Seat ${seat}</span>
            `).join(', ')}
        </div>
    `;

    document.getElementById('confirmSeats').disabled = 
        bookingState.selectedSeats.length !== bookingState.passengers.length;
}

function handleSeatConfirmation() {
    updateProgressBar(2);
    document.getElementById('seatSelection').style.display = 'none';
    document.getElementById('contactDetails').style.display = 'block';
    updateBookingSummary();
}

// Contact Details and Summary
function updateBookingSummary() {
    const summaryDetails = document.getElementById('summaryDetails');
    const fareDetails = document.getElementById('fareDetails');
    const totalFare = document.getElementById('totalFare');

    summaryDetails.innerHTML = `
        <div>
            <p><strong>Bus:</strong> ${bookingState.busDetails.company}</p>
            <p><strong>Type:</strong> ${bookingState.busDetails.type}</p>
            <p><strong>Passengers:</strong> ${bookingState.passengers.length}</p>
            <p><strong>Seats:</strong> ${bookingState.selectedSeats.join(', ')}</p>
        </div>
    `;

    const fare = bookingState.busDetails.price * bookingState.passengers.length;
    const tax = fare * 0.18; // 18% GST
    bookingState.totalFare = fare + tax;

    fareDetails.innerHTML = `
        <p>Base Fare (${bookingState.passengers.length} × ₹${bookingState.busDetails.price}): ₹${fare}</p>
        <p>Tax (18% GST): ₹${tax.toFixed(2)}</p>
    `;

    totalFare.innerHTML = `<strong>Total Fare: ₹${bookingState.totalFare.toFixed(2)}</strong>`;
}

function handlePaymentRedirect() {
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const sendUpdates = document.getElementById('sendUpdates').checked;

    if (email && phone) {
        bookingState.contactDetails = { email, phone, sendUpdates };
        showSection('payment');
        updateProgressBar(3);
        startPaymentTimer();
        updatePaymentDetails();
    } else {
        alert('Please fill in all contact details');
    }
}

// Payment Timer
let paymentTimer;
let remainingTime = 600; // 10 minutes in seconds

function startPaymentTimer() {
    updateTimerDisplay();
    paymentTimer = setInterval(() => {
        remainingTime--;
        if (remainingTime <= 0) {
            clearInterval(paymentTimer);
            showPaymentFailed();
        } else {
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById('paymentTimer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updatePaymentDetails() {
    const ticketBreakdown = document.getElementById('ticketBreakdown');
    const taxBreakdown = document.getElementById('taxBreakdown');
    const totalAmount = document.getElementById('totalAmount');
    const payButtonAmount = document.getElementById('payButtonAmount');

    const baseFare = bookingState.busDetails.price * bookingState.passengers.length;
    const tax = baseFare * 0.18; // 18% GST

    ticketBreakdown.innerHTML = `
        <p>${bookingState.passengers.length} × ₹${bookingState.busDetails.price} = ₹${baseFare}</p>
    `;

    taxBreakdown.innerHTML = `
        <p>GST (18%): ₹${tax.toFixed(2)}</p>
    `;

    totalAmount.textContent = `₹${bookingState.totalFare.toFixed(2)}`;
    payButtonAmount.textContent = bookingState.totalFare.toFixed(2);
}

function showPaymentProcessing() {
    document.getElementById('paymentStatus').style.display = 'flex';
    document.getElementById('processingScreen').style.display = 'block';
    document.getElementById('successScreen').style.display = 'none';
    document.getElementById('failedScreen').style.display = 'none';
}

function showPaymentSuccess() {
    document.getElementById('processingScreen').style.display = 'none';
    document.getElementById('successScreen').style.display = 'block';
    setTimeout(() => {
        createTicket(bookingState);
        showSection('tickets');
        document.getElementById('paymentStatus').style.display = 'none';
    }, 2000);
}

function showPaymentFailed() {
    document.getElementById('processingScreen').style.display = 'none';
    document.getElementById('failedScreen').style.display = 'block';
}

function handlePayment() {
    showPaymentProcessing();
    // Simulate payment processing
    setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate
        if (success) {
            showPaymentSuccess();
        } else {
            showPaymentFailed();
        }
    }, 5000);
}

function goBack() {
    document.getElementById('paymentStatus').style.display = 'none';
    remainingTime = 600;
    startPaymentTimer();
}

function goToBookings() {
    showSection('tickets');
    document.getElementById('paymentStatus').style.display = 'none';
}

// Simulated ticket data
let tickets = [];

// Function to generate a unique barcode for each passenger
function generateBarcodeNumber() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Function to create a new ticket after successful payment
function createTicket(bookingDetails) {
    const ticket = {
        id: Date.now(),
        from: bookingDetails.busDetails.from ,
        to: bookingDetails.busDetails.to,
        departureTime: bookingDetails.busDetails.departure ,
        arrivalTime: bookingDetails.busDetails.arrival,
        passengers: bookingDetails.passengers.length,
        seatNumbers: bookingDetails.selectedSeats,
        ticketNumber: generateBarcodeNumber(),
        status: 'CONFIRMED',
        barcodeData: generateBarcodeNumber(),
        date: bookingDetails.busDetails.date || 'Oct 10',
        price: `₹${bookingDetails.totalFare.toFixed(2)}`
    };
    
    tickets.push(ticket);
    updateTicketsList();
    return ticket;
}

// Function to update the tickets list display
function updateTicketsList() {
    const activeTickets = tickets.filter(t => t.status === 'CONFIRMED');
    const cancelledTickets = tickets.filter(t => t.status === 'CANCELLED');
    
    document.getElementById('activeTickets').innerHTML = activeTickets.map(ticket => `
        <div class="ticket-card" onclick="showTicketDetails('${ticket.id}')">
            <div class="route-info">
                <div>
                    <div class="station">${ticket.from}</div>
                    <div class="station-code">CHN</div>
                </div>
                <div style="text-align: right;">
                    <div class="station">${ticket.to}</div>
                    <div class="station-code">BLR</div>
                </div>
            </div>
            <div class="ticket-details">
                <span><i class="fas fa-calendar"></i> ${ticket.date}</span>
                <span><i class="fas fa-users"></i> ${ticket.passengers} Persons</span>
                <span>${ticket.price}</span>
            </div>
        </div>
    `).join('');

    document.getElementById('cancelledTickets').innerHTML = cancelledTickets.map(ticket => `
        <div class="ticket-card" onclick="showTicketDetails('${ticket.id}')">
            <div class="route-info">
                <div>
                    <div class="station">${ticket.from}</div>
                    <div class="station-code">CHN</div>
                </div>
                <div style="text-align: right;">
                    <div class="station">${ticket.to}</div>
                    <div class="station-code">BLR</div>
                </div>
            </div>
            <div class="ticket-details">
                <span><i class="fas fa-calendar"></i> ${ticket.date}</span>
                <span><i class="fas fa-users"></i> ${ticket.passengers} Persons</span>
                <span>${ticket.price}</span>
            </div>
            <div class="ticket-status cancelled">CANCELLED</div>
        </div>
    `).join('');
}

// Function to show ticket details
function showTicketDetails(ticketId) {
    const ticket = tickets.find(t => t.id === parseInt(ticketId));
    if (!ticket) return;

    document.getElementById('departureTime').textContent = `${ticket.date}, ${ticket.departureTime}`;
    document.getElementById('arrivalTime').textContent = `${ticket.date}, ${ticket.arrivalTime}`;
    document.getElementById('passengerCount').textContent = `${ticket.passengers} Adults`;
    document.getElementById('seatNumbers').textContent = ticket.seatNumbers.join(', ');
    document.getElementById('ticketNumber').textContent = ticket.ticketNumber;
    document.getElementById('ticketStatus').textContent = ticket.status;
    document.getElementById('ticketStatus').className = `ticket-status ${ticket.status === 'CANCELLED' ? 'cancelled' : ''}`;

    // Generate and display barcode
    JsBarcode("#barcode", ticket.barcodeData, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true
    });

    // Show/hide cancel button based on ticket status
    const cancelBtn = document.getElementById('cancelTicketBtn');
    cancelBtn.style.display = ticket.status === 'CONFIRMED' ? 'block' : 'none';

    document.getElementById('fullTicket').classList.add('active');
}

// Function to close full ticket view
function closeFullTicket() {
    document.getElementById('fullTicket').classList.remove('active');
}

// Function to cancel ticket
function cancelTicket(ticketId) {
    const ticket = tickets.find(t => t.id === parseInt(ticketId));
    if (ticket && ticket.status === 'CONFIRMED') {
        ticket.status = 'CANCELLED';
        updateTicketsList();
        showTicketDetails(ticketId);
    }
}

// Cancel ticket button handler
document.getElementById('cancelTicketBtn').addEventListener('click', () => {
    const ticketNumber = document.getElementById('ticketNumber').textContent;
    const ticket = tickets.find(t => t.ticketNumber === ticketNumber);
    if (ticket && confirm('Are you sure you want to cancel this ticket?')) {
        cancelTicket(ticket.id);
    }
});

// Rating functionality
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        document.querySelectorAll('.star').forEach((s, index) => {
            s.style.color = index < rating ? '#ffd700' : '#ddd';
        });
    });
});

// Initialize the app
initializeApp();
