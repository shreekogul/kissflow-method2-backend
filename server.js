const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'jobs.json');

// Helper function to read jobs from jobs.json safely
function readJobsFile() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading jobs.json:", error);
        return [];
    }
}

// Helper function to write jobs to jobs.json safely
function writeJobsFile(jobs) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing jobs.json:", error);
    }
}

// 1. WEBHOOK ENDPOINT (Receives new jobs from Kissflow and saves to jobs.json)
app.post('/api/webhook-job', (req, res) => {
    const newJob = req.body;
    console.log("Received Kissflow payload:", newJob);

    let jobs = readJobsFile();
    jobs.push(newJob);
    writeJobsFile(jobs);

    console.log("Job successfully saved to jobs.json!");
    res.status(200).json({ success: true, message: "Job saved permanently!" });
});

// 2. FETCH ENDPOINT (Sends saved jobs from jobs.json to your frontend portal)
app.get('/api/portal-jobs', (req, res) => {
    const jobs = readJobsFile();
    res.status(200).json({
        success: true,
        data: jobs
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Method 2 Server running on port ${PORT}`);
});