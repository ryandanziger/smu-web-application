// backend/server.js (FINALIZED CODE)

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 3001;

// Database Configuration 
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // FIX: Limit pool size to avoid connection exhaustion on managed DBs
    max: 5, 
    // CRITICAL: Required for DigitalOcean managed SSL
    ssl: { 
        rejectUnauthorized: false, 
    },
});

// backend/server.js (Add this after the pool configuration)

// --- END ONE-TIME SEQUENCE FIX FUNCTION ---

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your React frontend
}));
app.use(express.json()); 


// ---------------------------------------------
// --- API Endpoint: Fetch Teammates (GET) ---
// ---------------------------------------------
app.get('/api/teammates', async (req, res) => {
    // MOCK: Assuming 'Ryan Danziger' (studentid 3) is the current evaluator
    const evaluatorId = 3; 
    let client; // Used for connection leak fix

    const query = `
        SELECT 
            studentid AS id, 
            studentname AS name
        FROM public.student  -- *** FIX: public. prefix added ***
        WHERE studentid != $1
        ORDER BY studentname;
    `;

    try {
        client = await pool.connect(); // FIX: Manual acquire for reliable release
        const result = await client.query(query, [evaluatorId]); 
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching student list:', err.stack);
        res.status(500).json({ message: 'Failed to retrieve teammate list from database.' });
    } finally {
        if (client) {
            client.release(); // FIX: Ensure client is released
        }
    }
});


// ---------------------------------------------
// --- API Endpoint: Submit Evaluation (POST) ---
// ---------------------------------------------
app.post('/api/submit-evaluation', async (req, res) => {
    const { 
        teammateId, 
        evaluatorId,
        feedback,
        contribution_score, 
        plan_mgmt_score, 
        team_climate_score, 
        conflict_res_score, 
        overall_rating
    } = req.body;

    const submittedAt = new Date().toISOString(); 
    
    // 1. Insert into the main 'peerevaluation' table
    const evalQuery = `
        INSERT INTO public.peerevaluation (evaluatorid, submitted_at) -- *** FIX: public. prefix added ***
        VALUES ($1, $2)
        RETURNING evaluationid;
    `;

    // 2. Insert into the 'peerevaluation_target' table with scores
    const targetQuery = `
        INSERT INTO public.peerevaluation_target ( -- *** FIX: public. prefix added ***
            evaluationid, 
            evaluateeid, 
            contribution_score, 
            plan_mgmt_score, 
            team_climate_score, 
            conflict_res_score, 
            overall_rating,
            feedback_comments 
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;

    const client = await pool.connect(); // Acquire client for transaction

    try {
        await client.query('BEGIN'); 

        const evalResult = await client.query(evalQuery, [evaluatorId, submittedAt]);
        const evaluationId = evalResult.rows[0].evaluationid;

        const targetValues = [
            evaluationId,
            teammateId,
            contribution_score,
            plan_mgmt_score,
            team_climate_score,
            conflict_res_score,
            overall_rating,
            feedback
        ];
        
        await client.query(targetQuery, targetValues);

        await client.query('COMMIT'); 
        res.status(200).json({ message: 'Evaluation submitted successfully', evaluationId });

    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error('Database transaction error:', err.stack);
        res.status(500).json({ message: 'Failed to submit evaluation to database.' });
    } finally {
        client.release(); // Ensure client is released
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log('Teammate fetch API ready at /api/teammates');
});