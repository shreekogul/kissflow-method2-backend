const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const JOBS_FILE = path.join(__dirname, 'portal-jobs.json');

// Initialize local JSON storage if it doesn't exist
if (!fs.existsSync(JOBS_FILE)) {
    fs.writeFileSync(JOBS_FILE, '[]', 'utf8');
}

// GET Endpoint for Careers Portal frontend
app.get('/api/portal-jobs', (req, res) => {
    fs.readFile(JOBS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read jobs file' });
        res.json(JSON.parse(data || '[]'));
    });
});

// POST Webhook Endpoint for Kissflow Integration
app.post('/api/webhook/kissflow-job', (req, res) => {
    console.log("Received Kissflow payload:", req.body);

    const newJob = req.body.Job_Vacancy || req.body;

    fs.readFile(JOBS_FILE, 'utf8', (err, data) => {
        const jobs = err ? [] : JSON.parse(data || '[]');

        const jobEntry = {
            id: Date.now(),
            ...newJob
        };

        jobs.unshift(jobEntry);

        fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: 'Failed to save job record' });
            }
            console.log("Job successfully saved!");
            res.status(200).json({ message: 'Job posted successfully!', job: jobEntry });
        });
    });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Method 2 Server running on http://localhost:${PORT}`);
});