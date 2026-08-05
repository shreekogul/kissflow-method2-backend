require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("Method 2 Connected to MongoDB!"))
    .catch((err) => console.error("MongoDB Error:", err));

// Same collection as Method 1
const jobSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Job = mongoose.model("JobMethod1", jobSchema);

// Receive data from Kissflow Method 2
app.post("/api/webhook-job", async (req, res) => {
    try {
        console.log("Received Kissflow payload:", req.body);

        const vacancy = req.body["Job Vacancy"];

        const newJob = new Job({
            "Job title": vacancy.jobTitle,
            "Department": vacancy.department,
            "Status": vacancy.status,
            "Location": vacancy.location,
            "Employment Type": vacancy.employmentType,
            "Remote Status": vacancy.remoteStatus,
            "Salary Range": vacancy.salaryRange,
            "Openings": vacancy.openings,
            "About the Role": vacancy.aboutRole,
            "Responsibilities": vacancy.responsibilities,
            "Requirements": vacancy.requirements,
            "Vacancy Slug/ID": vacancy.vacancySlug
        });

        await newJob.save();

        console.log("Method 2 saved job to MongoDB!");

        res.status(200).json({
            success: true,
            message: "Job saved permanently!"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Send jobs to frontend
app.get("/api/portal-jobs", async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: jobs
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Method 2 Server running on port ${PORT}`);
});