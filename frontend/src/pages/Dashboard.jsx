import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://expense-tracker-icua.onrender.com";

const Dashboard = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({ total: 0, categories: {} });

  const token = localStorage.getItem("token");

  // redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchTransactions();
      fetchSummary();
    }
  }, []);

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API}/api/transactions`, authHeader);
      setTransactions(res.data);
    } catch (error) {
      console.error("Fetch transactions error:", error);
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `${API}/api/transactions/summary/data`,
        authHeader
      );
      setSummary(res.data);
    } catch (error) {
      console.error("Fetch summary error:", error);
    }
  };

  const addTransaction = async () => {
    if (!title || !amount || !date) {
      alert("Please fill all required fields");
      return;
    }

    const newTransaction = { title, amount, category, date, notes };

    try {
      const res = await axios.post(
        `${API}/api/transactions`,
        newTransaction,
        authHeader
      );

      setTransactions([...transactions, res.data]);
      fetchSummary();

      setTitle("");
      setAmount("");
      setDate("");
      setNotes("");
    } catch (error) {
      console.error("Add transaction error:", error);
      alert("Unauthorized. Please login again.");
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API}/api/transactions/${id}`, authHeader);
      setTransactions(transactions.filter((t) => t._id !== id));
      fetchSummary();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Unauthorized action");
    }
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || t.category === category)
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Expense Dashboard</h2>

      {/* SUMMARY */}
      <h3>Total Expense: ₹ {summary.total}</h3>

      <h4>Category Breakdown:</h4>
      <ul>
        {Object.keys(summary.categories).map((cat) => (
          <li key={cat}>
            {cat} : ₹ {summary.categories[cat]}
          </li>
        ))}
      </ul>

      <hr />

      {/* ADD TRANSACTION */}
      <h3>Add Transaction</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>Food</option>
        <option>Rent</option>
        <option>Travel</option>
        <option>Shopping</option>
        <option>Other</option>
      </select>

      <input
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button onClick={addTransaction}>Add</button>

      <hr />

      {/* SEARCH & FILTER */}
      <input
        placeholder="Search transaction"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select onChange={(e) => setCategory(e.target.value)}>
        <option value="All">All</option>
        <option>Food</option>
        <option>Rent</option>
        <option>Travel</option>
        <option>Shopping</option>
        <option>Other</option>
      </select>

      <h3>Transactions</h3>

      <ul>
        {filteredTransactions.length === 0 && <p>No transactions found</p>}

        {filteredTransactions.map((t) => (
          <li key={t._id}>
            {t.title} - ₹{t.amount} - {t.category} -{" "}
            {t.date.slice(0, 10)}
            <button onClick={() => deleteTransaction(t._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;

