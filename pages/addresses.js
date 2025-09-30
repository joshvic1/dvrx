"use client";
import { useState, useEffect } from "react";
import { Home, icons, Map, Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/ProfileSidebar.module.css"; // reuse or create a separate CSS file if needed

export default function Addresses() {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    houseNumber: "",
    street: "",
    localGovt: "",
    state: "",
    country: "Nigeria",
  });
  const [editingId, setEditingId] = useState(null);
  const [editAddress, setEditAddress] = useState({
    houseNumber: "",
    street: "",
    localGovt: "",
    state: "",
    country: "Nigeria",
  });
  const [loading, setLoading] = useState(false);

  // Fetch addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAddresses(data.addresses || []);
      else toast.error(data.message || "Failed to fetch addresses");
    } catch {
      toast.error("Server error");
    }
  };

  // Add new address
  const addAddress = async () => {
    const { houseNumber, street, localGovt, state } = newAddress;
    if (!houseNumber || !street || !localGovt || !state)
      return toast.error("All fields except country are required");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Address added");
        setAddresses((prev) => [...prev, data.address]);
        setNewAddress({
          houseNumber: "",
          street: "",
          localGovt: "",
          state: "",
          country: "Nigeria",
        });
      } else toast.error(data.message || "Failed to add address");
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEditing = (addr) => {
    setEditingId(addr._id);
    setEditAddress(addr);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditAddress({
      houseNumber: "",
      street: "",
      localGovt: "",
      state: "",
      country: "Nigeria",
    });
  };

  // Update address
  const updateAddress = async () => {
    try {
      const res = await fetch(`${API_URL}/api/address/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editAddress),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Address updated");
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editingId ? { ...addr, ...editAddress } : addr
          )
        );
        cancelEditing();
      } else toast.error(data.message || "Failed to update address");
    } catch {
      toast.error("Server error");
    }
  };

  // Delete address
  const deleteAddress = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`${API_URL}/api/address/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Address deleted");
        setAddresses((prev) => prev.filter((addr) => addr._id !== id));
      } else toast.error(data.message || "Failed to delete address");
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className={styles.addressSection}>
      <div className={styles.headerRow}>
        <h2>Saved Addresses</h2>
        <button className={styles.addBtn}>
          <Plus size={16} /> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <p className={styles.empty}>You haven’t saved any addresses yet.</p>
      ) : (
        <div className={styles.addressGrid}>
          {addresses.map((addr) => (
            <div key={addr._id} className={styles.addressCard}>
              <div className={styles.addressInfo}>
                <Home size={18} className={styles.icon} />
                <span>
                  {addr.houseNumber}, {addr.street}, {addr.localGovt},{" "}
                  {addr.state}, {addr.country}
                </span>
              </div>
              <div className={styles.actions}>
                <button onClick={() => startEditing(addr)}>
                  <Pencil size={16} />
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteAddress(addr._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.formSection}>
        <h3>{editingId ? "Edit Address" : "Add New Address"}</h3>
        <div className={styles.formGrid}>
          {["houseNumber", "street", "localGovt", "state", "country"].map(
            (field) => (
              <input
                key={field}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={editingId ? editAddress[field] : newAddress[field]}
                onChange={(e) =>
                  editingId
                    ? setEditAddress({
                        ...editAddress,
                        [field]: e.target.value,
                      })
                    : setNewAddress({ ...newAddress, [field]: e.target.value })
                }
              />
            )
          )}
        </div>
        <div className={styles.formActions}>
          <button
            className={styles.saveBtn}
            onClick={editingId ? updateAddress : addAddress}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editingId
              ? "Update Address"
              : "Save Address"}
          </button>
          {editingId && (
            <button className={styles.cancelBtn} onClick={cancelEditing}>
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
