// Global variables
const locations = [
  "Imphal", "Tamenglong", "Tamei", "Kakching", "Bishnupur",
  "Ukhrul", "Senapati", "Churchandpur", "Nungba", "Tengnoupal"
];

const buses = [
  { bus_id: "BUS001", from: "imphal", to: "tamenglong", name: "GAISUAKNGAM", rate: 500, time: "06:00 AM" },
  { bus_id: "BUS002", from: "tamenglong", to: "imphal", name: "SUAIHIAMGAN", rate: 500, time: "06:00 PM" },
  { bus_id: "BUS003", from: "imphal", to: "nungba", name: "Nungba Travels", rate: 600, time: "8:30 AM" },
  { bus_id: "BUS004", from: "imphal", to: "senapati", name: "Senapati Travels", rate: 120, time: "24/7" },
  { bus_id: "BUS005", from: "imphal", to: "ukhrul", name: "Ukhrul Travels", rate: 250, time: "11:00 AM" }
];

let foundBus = null; // Global scope for reuse in form submission

document.addEventListener("DOMContentLoaded", function () {
  const fromInputTop = document.getElementById("from");
  const fromInputBottom = document.getElementById("fromLocation");
  const toInputTop = document.getElementById("to");
  const toInputBelow = document.getElementById("toLocation");

  fromInputTop.addEventListener("input", function () {
    fromInputBottom.value = fromInputTop.value;
    toInputBelow.value = toInputTop.value;
  });

  toInputTop.addEventListener("input", function () {
    toInputBelow.value = toInputTop.value;
    fromInputBottom.value = fromInputTop.value;
  });
});

function setupAutocomplete(inputId, suggestionBoxId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionBoxId);

  input.addEventListener('input', () => {
    const value = input.value.toLowerCase();
    suggestions.innerHTML = '';
    if (!value) {
      suggestions.classList.add('hidden');
      return;
    }

    const matches = locations.filter(loc => loc.toLowerCase().includes(value));
    if (matches.length === 0) {
      suggestions.classList.add('hidden');
      return;
    }

    matches.forEach(loc => {
      const li = document.createElement('li');
      li.textContent = loc;
      li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
      li.addEventListener('click', () => {
        input.value = loc;
        suggestions.classList.add('hidden');
      });
      suggestions.appendChild(li);
    });

    suggestions.classList.remove('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!suggestions.contains(e.target) && e.target !== input) {
      suggestions.classList.add('hidden');
    }
  });
}

setupAutocomplete("from", "fromSuggestions");
setupAutocomplete("to", "toSuggestions");

async function searchBus(event) {
  event.preventDefault();
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const resultContainer = document.getElementById('busResults');

  if (from === to) {
    resultContainer.innerHTML = "<p style='color:red;'>From and To cannot be the same or Empty!</p>";
    return;
  }

  foundBus = buses.find(
    bus => bus.from.toLowerCase() === from.toLowerCase() && bus.to.toLowerCase() === to.toLowerCase()
  );

  if (!foundBus) {
    resultContainer.innerHTML = "<p>No bus found.</p>";
    return;
  }

  try {
    const res = await fetch(`http://localhost/finalproject/Admin/seats.php?action=get&bus_id=${foundBus.bus_id}`);
    const seats = await res.json();

    resultContainer.innerHTML = `
      <h3 style='color:black; font-weight:bold'>${foundBus.name}</h3>
      <p>${foundBus.from} → ${foundBus.to} at ${foundBus.time}</p>
      <p>&#8377 ${foundBus.rate} /- per seat</p>
      <div class="seating-chart">
        ${renderSeats(seats)}
      </div>
    `;
  } catch (error) {
    console.error("Failed to fetch seats:", error);
    resultContainer.innerHTML = "<p style='color:red;'>Error fetching seat data.</p>";
  }
}

function renderSeats(seats) {
  if (!seats || seats.length === 0) return "<p>No seat data available.</p>";

  let html = "";
  const seatsPerRow = 4;

  for (let i = 0; i < seats.length; i += seatsPerRow) {
    const row = seats.slice(i, i + seatsPerRow);
    row.forEach((seat, index) => {
      if (index === 2) html += `<div class="aisle"></div>`;
      html += `<div class="seat ${seat.status}">Seat ${seat.seat_number}</div>`;
    });
  }

  return html;
}

document.getElementById("paymentForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const seat = document.getElementById("seat_number").value;
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const from = document.getElementById("fromLocation").value;
  const to = document.getElementById("toLocation").value;

  if (!foundBus) {
    alert("No bus selected. Please search and select a route first.");
    return;
  }

  const amount = foundBus.rate;
  const busId = foundBus.bus_id;

  try {
    const checkRes = await fetch(`http://localhost/finalproject/Admin/fetchPayments.php?seat_number=${seat}&from=${from}&to=${to}&bus_id=${busId}`);
    const checkData = await checkRes.json();

    if (checkData.status === "booked") {
      alert("🚫 Seat already booked. Please choose another seat number.");
      return;
    }
  } catch (err) {
    console.error("Error checking seat:", err);
    alert("❌ Error verifying seat availability.");
    return;
  }

  const options = {
    key: "rzp_test_WUZomsUwI1tJks",
    amount: amount * 100,
    currency: "INR",
    name: "Bus Ticket Booking",
    description: `Seat ${seat} from ${from} to ${to}`,
    handler: async function (response) {
      const paymentData = {
        razorpay_payment_id: response.razorpay_payment_id,
        name,
        phone,
        email,
        seat,
        from,
        to,
        amount,
        busId: busId
      };

      try {
        const res = await fetch("http://localhost/finalproject/payment/paymentSuccess.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData)
        });

        const result = await res.json();
        if (result.invoice_url) {
          window.location.href = result.invoice_url;
        } else {
          alert("No invoice URL received.");
        }

        emailjs.send("service_4nx454w", "template_a3ti5o8", {
          name,
          from,
          to,
          seat_number: seat,
          email,
          razorpay_payment_id: response.razorpay_payment_id
        }).then(() => {
          alert("✅ Confirmation email sent!");
        }).catch((error) => {
          console.error("❌ Email send failed:", error);
          alert("Could not send confirmation email.");
        });

      } catch (err) {
        console.error("❌ Error storing payment:", err);
        alert("Payment succeeded but storing failed.");
      }
    },
    prefill: { name, email, contact: phone },
    notes: { from, to, seat },
    theme: { color: "#3399cc" }
  };

  const rzp = new Razorpay(options);
  rzp.open();
});
