const sendEmail = async (emailData) => {
    try {
      const response = await fetch("http://localhost:5000/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });
  
      return await response.json();
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };
  
  export default sendEmail;