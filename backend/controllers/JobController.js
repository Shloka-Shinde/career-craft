const Job = require("../models/JobPost"); // Import Job model

// Create a new job post
const createJob = async (req, res) => {
    try {
        const newJob = new Job(req.body);
        const savedJob = await newJob.save();
        res.json({ success: true, job: savedJob });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createJob };