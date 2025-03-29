import { useState } from "react";
import sendEmail from "../services/emailService";

const EmailModal = ({ isOpen, onClose, recipient }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!subject || !message) {
      alert("Please fill all fields!");
      return;
    }

    const response = await sendEmail({
      to: recipient,
      subject,
      text: message,
    });

    if (response?.message) {
      alert("Email sent successfully!");
      onClose();
    } else {
      alert("Failed to send email.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>Send Email</h2>
      <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={handleSend}>Send</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default EmailModal;