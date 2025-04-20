//   Search Input
const locations = [
    "Imphal", "Tamenglong", "Tamei", "Kakching", "Bishnupur",
    "Ukhrul", "Senapati", "Churchandpur", "Nungba","Tengnoupal"
  ];
  const buses = [
    {
      bus_id: "BUS001",
      from: "imphal",
      to: "tamenglong",
      name: "GAISUAKNGAM",
      rate: 500,
      time: "06:00 AM"
    },
    {
      bus_id: "BUS002",
      from: "tamenglong",
      to: "imphal",
      name: "Suaihiamgan",
      rate: 500,
      time: "06:00 PM"
    },
    {
      bus_id: "BUS003",
      from: "imphal",
      to: "nungba",
      name: "Nungba Travels",
      rate: 600,
      time: "8:30 AM"
    }
  ];
  


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

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!suggestions.contains(e.target) && e.target !== input) {
        suggestions.classList.add('hidden');
      }
    });
  }

  setupAutocomplete("from", "fromSuggestions");
  setupAutocomplete("to", "toSuggestions");
  const form = document.querySelector("form");
  const errorMsg = document.getElementById("errorMsg");
  const busResults = document.getElementById("busResults");



  async function searchBus() {
    event.preventDefault();
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const resultContainer = document.getElementById('busResults');
  
  // Check for same place
  if (from === to) {
    resultContainer.innerHTML = "<p style='color:red;'>From and To cannot be the same or Empty!</p>";
    return;
  }

  // Find a matching bus
  const foundBus = Object.values(buses).find(
    bus => bus.from.toLowerCase() === from.toLowerCase() && bus.to.toLowerCase() === to.toLowerCase()
  );

  if (!foundBus) {
    resultContainer.innerHTML = "<p>No bus found.</p>";
    return;
  }

  // Fetch seat status from database
  try {
    const res = await fetch(`http://localhost/finalproject/Admin/seats.php?action=get&bus_id=${foundBus.bus_id}`);
    console.log("Bus found", foundBus);
    console.log("Bus ID", foundBus.bus_id)
    const seats = await res.json();
    console.log("Fetched seat data:", seats); 

    busResults.innerHTML = `
      <h3 style='color:black; font-weight:bold'>${foundBus.name}</h3>
      <p>${foundBus.from} → ${foundBus.to} at ${foundBus.time}</p>
      <p>&#8377 ${foundBus.rate} /- per seat</p>
      <div class="seating-chart">
        ${renderSeats(seats)}
      </div>
    `;
  } catch (error) {
    console.error("Failed to fetch seats:", error);
    busResults.innerHTML = "<p style='color:red;'>Error fetching seat data.</p>";
  }
  function renderSeats(seats) {
    if (!seats || seats.length === 0) {
      return "<p>No seat data available.</p>";
    }
  
    return seats.map(seat => {
      return `<div class="seat ${seat.status}">Seat ${seat.seat_number}</div>`;
    }).join('');
  }
}


document.getElementById("paymentForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const seat = document.getElementById("seat_number").value;
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const from = document.getElementById("fromLocation").value;
  const to = document.getElementById("toLocation").value;
  const amount = 500;

  // 🔎 STEP 1: Check if the seat is already booked
  try {
    const checkRes = await fetch(`http://localhost/finalproject/Admin/fetchPayments.php?seat_number=${seat}`);
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

  // ✅ STEP 2: Continue with Razorpay payment
  const options = {
    key: "rzp_test_WUZomsUwI1tJks", 
    amount: amount * 100,
    currency: "INR",
    name: "Bus Ticket Booking",
    description: `Seat ${seat} from ${from} to ${to}`,
    handler: async function (response) {
      const paymentData = {
        razorpay_payment_id: response.razorpay_payment_id,
        name: name,
        phone: phone,
        email: email,
        seat: seat,
        from: from,
        to: to,
        amount: amount,
        bus_id: "BUS001"
      };

      try {
        const res = await fetch("http://localhost/finalproject/payment/paymentSuccess.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(paymentData)
        });

        const result = await res.json();
        alert(result.message);


        // ✅ EmailJS: Send confirmation
        emailjs.send("service_4nx454w", "template_a3ti5o8", {
          name: name,
          from: from,
          to: to,
          seat_number: seat,
          email: email,
          razorpay_payment_id: response.razorpay_payment_id
        })
        .then(() => {
          alert("✅ Confirmation email sent!");
        })
        .catch((error) => {
          console.error("❌ Email send failed:", error);
          alert("Could not send confirmation email.");
        });

      } catch (err) {
        console.error("❌ Error storing payment:", err);
        alert("Payment succeeded but storing failed.");
      }
    },
    prefill: {
      name: name,
      email: email,
      contact: phone,
    },
    notes: {
      from: from,
      to: to,
      seat: seat
    },
    theme: {
      color: "#3399cc"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
});


// invoice

function showInvoice(invoice) {
  const invoiceWindow = window.open('', '_blank');
  const html = `
    <html>
    <head>
      <title>Invoice</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
      <style>
        body { padding: 40px; }
        .invoice-box {
          max-width: 700px;
          margin: auto;
          padding: 30px;
          border: 1px solid #eee;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        }
        .title {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
        }
        th, td {
          padding: 10px;
          text-align: left;
        }
        .is-print {
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-box box">
        <h1 class="title is-3 has-text-centered has-text-primary">Bus Ticket Invoice</h1>
        <table class="table is-fullwidth is-striped">
          <tr><th>Payment ID</th><td>${invoice.razorpay_payment_id}</td></tr>
          <tr><th>Name</th><td>${invoice.fullname}</td></tr>
          <tr><th>Email</th><td>${invoice.email}</td></tr>
          <tr><th>Phone</th><td>${invoice.phone}</td></tr>
          <tr><th>From</th><td>${invoice.from_location}</td></tr>
          <tr><th>To</th><td>${invoice.to_location}</td></tr>
          <tr><th>Seat Number</th><td>${invoice.seat_number}</td></tr>
          <tr><th>Amount</th><td>₹${invoice.amount}</td></tr>
          <tr><th>Date</th><td>${invoice.timestamp}</td></tr>
        </table>
        <div class="has-text-centered is-print">
          <button class="button is-primary is-medium" onclick="window.print()">🖨️ Print Invoice</button>
        </div>
      </div>
    </body>
    </html>
  `;
  invoiceWindow.document.write(html);
  invoiceWindow.document.close();
}
