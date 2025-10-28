// backend/server.js (FINALIZED CODE)

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs'); 

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

// Configure multer for CSV file uploads
const upload = multer({ 
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    }
}); 

// ---------------------------------------------
// --- API Endpoint: User Signup (POST) ---
// ---------------------------------------------
app.post('/api/signup', async (req, res) => {
    const { username, email, password, role, firstName, lastName } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Check if user already exists
        const existingUser = await client.query(
            'SELECT id FROM public.users WHERE username = $1 OR email = $2',
            [username, email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        const insertQuery = `
            INSERT INTO public.users (username, email, password_hash, role, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, username, email, role, first_name, last_name, created_at;
        `;
        
        const result = await client.query(insertQuery, [
            username,
            email,
            passwordHash,
            role || 'student',
            firstName || null,
            lastName || null
        ]);
        
        const newUser = result.rows[0];
        
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                createdAt: newUser.created_at
            }
        });
        
    } catch (err) {
        console.error('Signup error:', err.stack);
        res.status(500).json({ message: 'Failed to create user account' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: User Login (POST) ---
// ---------------------------------------------
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Find user by username or email
        const userQuery = `
            SELECT id, username, email, password_hash, role, first_name, last_name, created_at
            FROM public.users 
            WHERE username = $1 OR email = $1
        `;
        
        const result = await client.query(userQuery, [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        const user = result.rows[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Return user data (excluding password hash)
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
                createdAt: user.created_at
            }
        });
        
    } catch (err) {
        console.error('Login error:', err.stack);
        res.status(500).json({ message: 'Login failed' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Forgot Password (POST) ---
// ---------------------------------------------
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Check if user exists
        const userQuery = 'SELECT id, username, email FROM public.users WHERE email = $1';
        const userResult = await client.query(userQuery, [email]);
        
        if (userResult.rows.length === 0) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({ 
                message: 'If an account with that email exists, a password reset link has been sent.' 
            });
        }
        
        const user = userResult.rows[0];
        
        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now, explicit UTC
        
        // Store reset token in database
        const updateQuery = `
            UPDATE public.users 
            SET reset_token = $1, 
                reset_token_expires = $2,
                password_reset_requested_at = CURRENT_TIMESTAMP
            WHERE id = $3
        `;
        
        await client.query(updateQuery, [resetToken, resetTokenExpires, user.id]);
        
        // In a real application, you would send an email here
        // For demo purposes, we'll return the reset link
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        
        console.log(`Password reset link for ${email}: ${resetLink}`);
        
        res.status(200).json({ 
            message: 'If an account with that email exists, a password reset link has been sent.',
            // In development, include the reset link for testing
            resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
        });
        
    } catch (err) {
        console.error('Forgot password error:', err.stack);
        res.status(500).json({ message: 'Failed to process password reset request' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Reset Password (POST) ---
// ---------------------------------------------
app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        return res.status(400).json({ message: 'Reset token and new password are required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Find user with valid reset token
        const userQuery = `
            SELECT id, reset_token_expires 
            FROM public.users 
            WHERE reset_token = $1 AND reset_token_expires > NOW() AT TIME ZONE 'UTC'
        `;
        
        const userResult = await client.query(userQuery, [token]);
        
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        
        const user = userResult.rows[0];
        
        // Hash new password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Update password and clear reset token
        const updateQuery = `
            UPDATE public.users 
            SET password_hash = $1, 
                reset_token = NULL, 
                reset_token_expires = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `;
        
        await client.query(updateQuery, [passwordHash, user.id]);
        
        res.status(200).json({ message: 'Password has been reset successfully' });
        
    } catch (err) {
        console.error('Reset password error:', err.stack);
        res.status(500).json({ message: 'Failed to reset password' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Verify Reset Token (GET) ---
// ---------------------------------------------
app.get('/api/verify-reset-token/:token', async (req, res) => {
    const { token } = req.params;
    
    if (!token) {
        return res.status(400).json({ message: 'Reset token is required' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Check if token is valid and not expired
        const tokenQuery = `
            SELECT id, reset_token_expires 
            FROM public.users 
            WHERE reset_token = $1 AND reset_token_expires > NOW() AT TIME ZONE 'UTC'
        `;
        
        const tokenResult = await client.query(tokenQuery, [token]);
        
        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        
        res.status(200).json({ message: 'Reset token is valid' });
        
    } catch (err) {
        console.error('Verify token error:', err.stack);
        res.status(500).json({ message: 'Failed to verify reset token' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Upload Students CSV (POST) ---
// ---------------------------------------------
app.post('/api/upload-students', upload.single('csvFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    let client;
    const results = [];
    const errors = [];

    try {
        client = await pool.connect();
        
        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                // Expected CSV format: studentname
                const student = {
                    name: data.studentname || data.name || data.student_name || data['Student Name']
                };
                
                if (student.name && student.name.trim()) {
                    results.push(student);
                } else {
                    errors.push(`Invalid row: ${JSON.stringify(data)}`);
                }
            })
            .on('end', async () => {
                try {
                    let successCount = 0;
                    let duplicateCount = 0;

                    // Insert students into database
                    for (const student of results) {
                        try {
                            // Check if student already exists
                            const existingStudent = await client.query(
                                'SELECT studentid FROM public.student WHERE studentname = $1',
                                [student.name]
                            );

                            if (existingStudent.rows.length > 0) {
                                duplicateCount++;
                                continue;
                            }

                            // Insert new student (using the same table structure as evaluation form)
                            await client.query(
                                'INSERT INTO public.student (studentname) VALUES ($1)',
                                [student.name]
                            );
                            successCount++;
                        } catch (err) {
                            errors.push(`Error inserting ${student.name}: ${err.message}`);
                        }
                    }

                    // Clean up uploaded file
                    fs.unlinkSync(req.file.path);

                    res.status(200).json({
                        message: 'CSV processing completed',
                        successCount,
                        duplicateCount,
                        errorCount: errors.length,
                        errors: errors.slice(0, 10) // Limit errors shown
                    });

                } catch (err) {
                    console.error('CSV processing error:', err);
                    res.status(500).json({ message: 'Error processing CSV file' });
                } finally {
                    if (client) client.release();
                }
            })
            .on('error', (err) => {
                console.error('CSV parsing error:', err);
                res.status(400).json({ message: 'Error parsing CSV file' });
                if (client) client.release();
            });

    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Error processing upload' });
        if (client) client.release();
    }
});

// ---------------------------------------------
// --- API Endpoint: Get All Students (GET) ---
// ---------------------------------------------
app.get('/api/students', async (req, res) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Build search query
        let whereClause = '';
        let queryParams = [];
        
        if (search) {
            whereClause = 'WHERE studentname ILIKE $1';
            queryParams.push(`%${search}%`);
        }
        
        // Get total count
        const countQuery = `SELECT COUNT(*) FROM public.student ${whereClause}`;
        const countResult = await client.query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].count);
        
        // Get students with pagination (using same structure as evaluation form)
        const studentsQuery = `
            SELECT studentid, studentname
            FROM public.student 
            ${whereClause}
            ORDER BY studentname
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;
        
        const studentsResult = await client.query(studentsQuery, [
            ...queryParams,
            limit,
            offset
        ]);
        
        res.status(200).json({
            students: studentsResult.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                limit: parseInt(limit)
            }
        });
        
    } catch (err) {
        console.error('Error fetching students:', err.stack);
        res.status(500).json({ message: 'Failed to fetch students' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

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