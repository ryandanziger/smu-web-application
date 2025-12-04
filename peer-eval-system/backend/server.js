// backend/server.js (FINALIZED CODE)

require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs'); 

const app = express();
const port = process.env.PORT || 3001;

// Database Configuration - Railway compatible
// Railway automatically provides DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false },
});

// Error handling for database connection
pool.on('error', (err) => {
  console.error('[DB] ❌ Unexpected error on idle database client:', err.message);
  console.error('[DB] Error code:', err.code);
});

// Test database connection on startup
pool.connect()
  .then(client => {
    console.log('[DB] ✅ Successfully connected to database');
    client.release();
  })
  .catch(err => {
    console.error('[DB] ❌ Failed to connect to database');
    console.error('[DB] Error message:', err.message || 'No error message');
    console.error('[DB] Error code:', err.code || 'No error code');
    console.error('[DB] Error stack:', err.stack);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('[DB] ⚠️  CONNECTION REFUSED - This means:');
      console.error('[DB]    1. The database host/port is unreachable');
      console.error('[DB]    2. DigitalOcean firewall is blocking the connection');
      console.error('[DB]    → Go to DigitalOcean Dashboard → Your Database → Settings → Trusted Sources');
      console.error('[DB]    → Add Render IP or temporarily add "0.0.0.0/0" for testing');
      console.error('[DB]    → Current connection:');
      console.error('[DB]       Host:', process.env.DB_HOST);
      console.error('[DB]       Port:', process.env.DB_PORT);
    } else if (err.code === 'ETIMEDOUT') {
      console.error('[DB] ⚠️  CONNECTION TIMEOUT - Check firewall/network settings');
    } else if (err.code === '28P01') {
      console.error('[DB] ⚠️  AUTHENTICATION FAILED - Check DB_USER and DB_PASSWORD');
    }
  });

// backend/server.js (Add this after the pool configuration)


// --- END ONE-TIME SEQUENCE FIX FUNCTION ---

// Middleware
// CORS configuration - allow requests from frontend
const corsOptions = {
    origin: function (origin, callback) {
        const corsOrigin = process.env.CORS_ORIGIN;
        const allowedOrigins = [
            corsOrigin,
            'http://localhost:3000',
            'http://localhost:3001'
        ].filter(Boolean); // Remove undefined values
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        
        // If no CORS_ORIGIN configured, allow all (for development/debugging)
        // Only log warning once on startup, not for every request
        if (!corsOrigin) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Only log blocked requests (errors)
            console.log(`❌ [CORS] Blocked origin: ${origin}`);
            console.log(`✅ [CORS] Allowed origins: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type'],
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use CORS middleware - it handles OPTIONS automatically
app.use(cors(corsOptions));
app.use(express.json());

// Log CORS configuration on startup (only once)
const allowedOriginsList = [
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
    'http://localhost:3001'
].filter(Boolean);
const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
    console.log('⚠️  [CORS] CORS_ORIGIN not set - allowing all origins (development mode)');
    console.log('⚠️  [CORS] For production, set CORS_ORIGIN=https://smu-web-application-1.onrender.com in Render environment variables');
} else {
    console.log('✅ [CORS] CORS_ORIGIN:', corsOrigin);
    console.log('✅ [CORS] Allowed origins:', allowedOriginsList.join(', '));
}

// Root route for health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'SMU Peer Evaluation API Server',
        status: 'running',
        endpoints: {
            // Authentication
            signup: 'POST /api/signup',
            login: 'POST /api/login',
            forgotPassword: 'POST /api/forgot-password',
            resetPassword: 'POST /api/reset-password',
            verifyResetToken: 'GET /api/verify-reset-token/:token',
            
            // Professors
            professors: 'GET /api/professors',
            professorCourses: 'GET /api/professors/:professorId/courses',
            
            // Courses
            courses: 'GET /api/courses',
            courseById: 'GET /api/courses/:courseId',
            createCourse: 'POST /api/courses',
            deleteCourse: 'DELETE /api/courses/:courseId',
            courseRoster: 'GET /api/courses/:courseId/roster',
            uploadCourseRoster: 'POST /api/courses/:courseId/upload-roster',
            
            // Students
            students: 'GET /api/students',
            uploadStudents: 'POST /api/upload-students',
            studentCourses: 'GET /api/students/:studentEmail/courses',
            
            // Groups
            createGroup: 'POST /api/courses/:courseId/groups',
            getGroups: 'GET /api/courses/:courseId/groups',
            addStudentsToGroup: 'POST /api/courses/:courseId/groups/:groupId/students',
            getGroupStudents: 'GET /api/courses/:courseId/groups/:groupId/students',
            removeStudentFromGroup: 'DELETE /api/courses/:courseId/groups/:groupId/students/:studentId',
            
            // Evaluations
            submitEvaluation: 'POST /api/submit-evaluation',
            getTeammates: 'GET /api/teammates',
            
            // Evaluation Assignments
            createEvaluationAssignment: 'POST /api/evaluation-assignments',
            getCourseAssignments: 'GET /api/courses/:courseId/evaluation-assignments',
            getStudentAssignments: 'GET /api/students/:studentEmail/evaluation-assignments',
            completeAssignment: 'PATCH /api/evaluation-assignments/:assignmentId/complete',
            deleteAssignment: 'DELETE /api/evaluation-assignments/:assignmentId'
        }
    });
});

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
        
        // If student, try to link to existing student record
        if (newUser.role === 'student') {
            try {
                // Ensure student table has user_id column
                await client.query(`
                    ALTER TABLE public.student 
                    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL
                `);
                
                // Try to find student record by email or name
                let studentResult = await client.query(
                    'SELECT studentid FROM public.student WHERE email = $1 OR user_id = $2 LIMIT 1',
                    [newUser.email, newUser.id]
                );
                
                if (studentResult.rows.length === 0) {
                    // Try to find by name matching
                    const fullName = `${newUser.first_name || ''} ${newUser.last_name || ''}`.trim();
                    if (fullName) {
                        studentResult = await client.query(
                            'SELECT studentid FROM public.student WHERE studentname ILIKE $1 AND user_id IS NULL LIMIT 1',
                            [`%${fullName}%`]
                        );
                    }
                }
                
                if (studentResult.rows.length > 0) {
                    // Link student record to user account
                    await client.query(
                        'UPDATE public.student SET user_id = $1, email = COALESCE(email, $2) WHERE studentid = $3',
                        [newUser.id, newUser.email, studentResult.rows[0].studentid]
                    );
                    console.log(`Linked student record ${studentResult.rows[0].studentid} to user account ${newUser.id}`);
                }
            } catch (err) {
                // Non-critical, just log
                console.log('Note: Could not link student record during signup:', err.message);
            }
        }
        
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
        
        // If student, try to link to student record on login
        if (user.role === 'student') {
            try {
                // Ensure student table has user_id column
                await client.query(`
                    ALTER TABLE public.student 
                    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL
                `);
                
                // Check if already linked
                let studentResult = await client.query(
                    'SELECT studentid FROM public.student WHERE user_id = $1 LIMIT 1',
                    [user.id]
                );
                
                if (studentResult.rows.length === 0) {
                    // Try to find by email
                    studentResult = await client.query(
                        'SELECT studentid FROM public.student WHERE email = $1 LIMIT 1',
                        [user.email]
                    );
                    
                    if (studentResult.rows.length > 0) {
                        // Link student record to user account
                        await client.query(
                            'UPDATE public.student SET user_id = $1, email = COALESCE(email, $2) WHERE studentid = $3',
                            [user.id, user.email, studentResult.rows[0].studentid]
                        );
                    } else {
                        // Try name matching
                        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                        if (fullName) {
                            studentResult = await client.query(
                                'SELECT studentid FROM public.student WHERE studentname ILIKE $1 AND user_id IS NULL LIMIT 1',
                                [`%${fullName}%`]
                            );
                            
                            if (studentResult.rows.length > 0) {
                                await client.query(
                                    'UPDATE public.student SET user_id = $1, email = COALESCE(email, $2) WHERE studentid = $3',
                                    [user.id, user.email, studentResult.rows[0].studentid]
                                );
                            }
                        }
                    }
                }
            } catch (err) {
                // Non-critical, just log
                console.log('Note: Could not link student record during login:', err.message);
            }
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
        console.error('[LOGIN] ERROR:', err.message);
        console.error('[LOGIN] ERROR Stack:', err.stack);
        console.error('[LOGIN] ERROR Code:', err.code);
        console.error('[LOGIN] ERROR Detail:', err.detail);
        res.status(500).json({ 
            message: 'Login failed',
            error: err.message,
            detail: err.detail || null
        });
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
// --- API Endpoint: Get All Professors (GET) ---
// ---------------------------------------------
app.get('/api/professors', async (req, res) => {
    let client;
    
    try {
        console.log('[GET /api/professors] Starting request');
        client = await pool.connect();
        console.log('[GET /api/professors] Database connection acquired');
        
        // Get all users with role 'professor' who have at least one course
        // First, get all professor users
        const usersQuery = `
            SELECT DISTINCT u.id, u.username, u.email, u.first_name, u.last_name
            FROM public.users u
            WHERE u.role = 'professor'
            ORDER BY u.username
        `;
        
        console.log('[GET /api/professors] Executing users query');
        const usersResult = await client.query(usersQuery);
        console.log(`[GET /api/professors] Found ${usersResult.rows.length} professor users`);
        
        // For each user, check if they have courses by finding their professor record
        const professors = [];
        
        for (const user of usersResult.rows) {
            try {
                // Try to find professor record by email, username, or name
                let profResult = await client.query(
                    'SELECT professorid, email, professorname FROM public.professor WHERE email = $1 OR professorname = $2 OR professorname = $3',
                    [user.email, user.username, `${user.first_name || ''} ${user.last_name || ''}`.trim()]
                );
                
                if (profResult.rows.length > 0) {
                    const profId = profResult.rows[0].professorid;
                    console.log(`[GET /api/professors] Found professor record for user ${user.username}, ID: ${profId}`);
                    
                    // Check if this professor has any courses
                    const courseCheck = await client.query(
                        'SELECT COUNT(*) as course_count FROM public.course WHERE professorid = $1',
                        [profId]
                    );
                    
                    const courseCount = parseInt(courseCheck.rows[0].course_count);
                    console.log(`[GET /api/professors] User ${user.username} has ${courseCount} courses`);
                    
                    if (courseCount > 0) {
                        professors.push({
                            username: user.username,
                            email: user.email || profResult.rows[0].email,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            professorid: profId,
                            professorname: profResult.rows[0].professorname || user.username
                        });
                    }
                } else {
                    console.log(`[GET /api/professors] No professor record found for user ${user.username}`);
                }
            } catch (userErr) {
                console.error(`[GET /api/professors] Error processing user ${user.username}:`, userErr.message);
                // Continue with next user
            }
        }
        
        console.log(`[GET /api/professors] Returning ${professors.length} professors with courses`);
        res.status(200).json({
            professors: professors
        });
        
    } catch (err) {
        console.error('[GET /api/professors] ERROR:', err.message);
        console.error('[GET /api/professors] ERROR Stack:', err.stack);
        console.error('[GET /api/professors] ERROR Code:', err.code);
        console.error('[GET /api/professors] ERROR Detail:', err.detail);
        res.status(500).json({ 
            message: 'Failed to fetch professors',
            error: err.message,
            detail: err.detail || null
        });
    } finally {
        if (client) {
            client.release();
            console.log('[GET /api/professors] Database connection released');
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Get Student Courses (GET) ---
// ---------------------------------------------
app.get('/api/students/:studentEmail/courses', async (req, res) => {
    const { studentEmail } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        // First, try to find student by email in student table
        let studentResult = await client.query(
            'SELECT studentid, studentname, email FROM public.student WHERE email = $1 LIMIT 1',
            [studentEmail]
        );
        
        // If not found, try to find by matching user email and student name
        // This handles cases where student was created via CSV without email
        if (studentResult.rows.length === 0) {
            // Get user info
            const userResult = await client.query(
                'SELECT id, username, email, first_name, last_name FROM public.users WHERE email = $1 LIMIT 1',
                [studentEmail]
            );
            
            if (userResult.rows.length > 0) {
                const user = userResult.rows[0];
                // Try to find student by name match (first + last or username)
                const nameMatch = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
                studentResult = await client.query(
                    'SELECT studentid, studentname, email FROM public.student WHERE studentname ILIKE $1 LIMIT 1',
                    [nameMatch]
                );
                
                // If found, update student email to match user email
                if (studentResult.rows.length > 0) {
                    await client.query(
                        'UPDATE public.student SET email = $1 WHERE studentid = $2',
                        [studentEmail, studentResult.rows[0].studentid]
                    );
                    studentResult.rows[0].email = studentEmail;
                }
            }
        }
        
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found. Please ensure you are enrolled in courses.' });
        }
        
        const studentId = studentResult.rows[0].studentid;
        
        // Get courses for this student
        const coursesQuery = `
            SELECT DISTINCT
                c.courseid,
                c.course_name,
                c.semester,
                c.class_time,
                p.professorid,
                p.professorname,
                p.email as professor_email
            FROM public.student_course sc
            JOIN public.course c ON sc.courseid = c.courseid
            JOIN public.professor p ON c.professorid = p.professorid
            WHERE sc.studentid = $1
            ORDER BY c.semester DESC, c.course_name
        `;
        
        const coursesResult = await client.query(coursesQuery, [studentId]);
        
        res.status(200).json({
            student: {
                studentid: studentId,
                studentname: studentResult.rows[0].studentname,
                email: studentResult.rows[0].email
            },
            courses: coursesResult.rows
        });
        
    } catch (err) {
        console.error('Get student courses error:', err.stack);
        res.status(500).json({ message: 'Failed to fetch student courses' });
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
    const { courseId, groupId, studentEmail } = req.query;
    
    if (!courseId || !groupId || !studentEmail) {
        return res.status(400).json({ message: 'courseId, groupId, and studentEmail are required' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        
        // First, try to find student by email
        let studentResult = await client.query(
            'SELECT studentid FROM public.student WHERE email = $1 LIMIT 1',
            [studentEmail]
        );
        
        // If not found, try to find by matching user email and student name
        if (studentResult.rows.length === 0) {
            const userResult = await client.query(
                'SELECT id, username, email, first_name, last_name FROM public.users WHERE email = $1 LIMIT 1',
                [studentEmail]
            );
            
            if (userResult.rows.length > 0) {
                const user = userResult.rows[0];
                const nameMatch = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
                studentResult = await client.query(
                    'SELECT studentid FROM public.student WHERE studentname ILIKE $1 LIMIT 1',
                    [nameMatch]
                );
            }
        }
        
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const evaluatorId = studentResult.rows[0].studentid;
        
        // Get teammates from the same group in the same course (excluding the evaluator)
        const query = `
            SELECT 
                s.studentid AS id, 
                s.studentname AS name
            FROM public.student_group sg
            JOIN public.student s ON sg.studentid = s.studentid
            WHERE sg.courseid = $1 
                AND sg.groupid = $2
                AND s.studentid != $3
            ORDER BY s.studentname;
        `;

        const result = await client.query(query, [courseId, groupId, evaluatorId]); 
        res.status(200).json({
            teammates: result.rows,
            evaluatorId: evaluatorId
        });
    } catch (err) {
        console.error('Error fetching teammates:', err.stack);
        res.status(500).json({ message: 'Failed to retrieve teammate list from database.' });
    } finally {
        if (client) {
            client.release();
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

// ---------------------------------------------
// --- API Endpoint: Create Course (POST) ---
// ---------------------------------------------
app.post('/api/courses', async (req, res) => {
    const { courseName, semester, classTime, professorId, userEmail, userName } = req.body;
    
    console.log(`[CREATE COURSE] Request received:`, {
        courseName,
        semester,
        classTime,
        professorId,
        userEmail,
        userName
    });
    
    if (!courseName || !semester) {
        return res.status(400).json({ message: 'Course name and semester are required' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        
        await client.query('BEGIN');
        
        // Get or create professor record
        let professorRecord;
        
        if (professorId) {
            // Try to find professor by ID first
            const profResult = await client.query(
                'SELECT professorid FROM public.professor WHERE professorid = $1',
                [professorId]
            );
            
            if (profResult.rows.length > 0) {
                professorRecord = profResult.rows[0];
            }
        }
        
        // If no professor found by ID, try to find/create by email or username
        if (!professorRecord && (userEmail || userName)) {
            // Try to find by email OR username (check both to avoid duplicates)
            let profResult = null;
            
            if (userEmail) {
                profResult = await client.query(
                    'SELECT professorid, email, professorname FROM public.professor WHERE email = $1',
                    [userEmail]
                );
            }
            
            // If not found by email, try by username
            if (!profResult || profResult.rows.length === 0) {
                if (userName) {
                    profResult = await client.query(
                        'SELECT professorid, email, professorname FROM public.professor WHERE professorname = $1',
                        [userName]
                    );
                }
            }
            
            if (profResult && profResult.rows.length > 0) {
                professorRecord = profResult.rows[0];
                // Update professor record to ensure both email and name are set
                const needsUpdate = (userEmail && profResult.rows[0].email !== userEmail) || 
                                   (userName && profResult.rows[0].professorname !== userName);
                
                if (needsUpdate) {
                    await client.query(
                        'UPDATE public.professor SET email = COALESCE($1, email), professorname = COALESCE($2, professorname) WHERE professorid = $3',
                        [userEmail || null, userName || null, professorRecord.professorid]
                    );
                }
            } else {
                // Create new professor record with both email and username
                const createProf = await client.query(
                    'INSERT INTO public.professor (professorname, email) VALUES ($1, $2) RETURNING professorid',
                    [userName || 'Professor', userEmail || null]
                );
                professorRecord = createProf.rows[0];
                console.log(`Created professor record with ID: ${professorRecord.professorid}, email: ${userEmail}, name: ${userName}`);
                
                // Verify the professor was created
                const verifyProf = await client.query(
                    'SELECT professorid, email, professorname FROM public.professor WHERE professorid = $1',
                    [professorRecord.professorid]
                );
                console.log('Verified professor record:', verifyProf.rows[0]);
            }
        }
        
        if (!professorRecord) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Could not identify professor. Please provide email or username.' });
        }
        
        console.log(`[CREATE COURSE] Creating course with professorid: ${professorRecord.professorid}`);
        console.log(`[CREATE COURSE] Professor record:`, {
            professorid: professorRecord.professorid,
            email: userEmail,
            username: userName
        });
        
        const insertQuery = `
            INSERT INTO public.course (professorid, course_name, semester, class_time)
            VALUES ($1, $2, $3, $4)
            RETURNING courseid, professorid, course_name, semester, class_time;
        `;
        
        const result = await client.query(insertQuery, [
            professorRecord.professorid,
            courseName,
            semester,
            classTime || null
        ]);
        
        await client.query('COMMIT');
        
        const newCourse = result.rows[0];
        console.log(`[CREATE COURSE] Course created successfully:`, newCourse);
        console.log(`[CREATE COURSE] Course linked to professor ID: ${newCourse.professorid}`);
        
        res.status(201).json({
            message: 'Course created successfully',
            course: {
                courseid: newCourse.courseid,
                professorid: newCourse.professorid,
                course_name: newCourse.course_name,
                semester: newCourse.semester,
                class_time: newCourse.class_time
            }
        });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create course error:', err.stack);
        res.status(500).json({ message: 'Failed to create course' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Get All Courses (for debugging) (GET) ---
// ---------------------------------------------
app.get('/api/courses', async (req, res) => {
    let client;
    
    try {
        client = await pool.connect();
        
        const query = `
            SELECT c.courseid, c.course_name, c.semester, c.class_time, c.professorid,
                   p.email as professor_email, p.professorname,
                   COUNT(DISTINCT sc.studentid) as student_count
            FROM public.course c
            LEFT JOIN public.professor p ON c.professorid = p.professorid
            LEFT JOIN public.student_course sc ON c.courseid = sc.courseid
            GROUP BY c.courseid, c.course_name, c.semester, c.class_time, c.professorid, p.email, p.professorname
            ORDER BY c.semester DESC, c.course_name;
        `;
        
        const result = await client.query(query);
        
        res.status(200).json({ courses: result.rows });
        
    } catch (err) {
        console.error('Get all courses error:', err.stack);
        res.status(500).json({ message: 'Failed to fetch courses' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Get Professor Courses (GET) ---
// ---------------------------------------------
app.get('/api/professors/:professorId/courses', async (req, res) => {
    const { professorId } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        // professorId can be a username, email, or numeric ID
        let profId = null;
        
        // If professorId is not a number, try to find by username first (from users table)
        if (isNaN(professorId)) {
            console.log(`Looking up professor with identifier: ${professorId}`);
            
            // First, try to find user by username
            const userResult = await client.query(
                'SELECT id, username, email, first_name, last_name FROM public.users WHERE username = $1 AND role = $2',
                [professorId, 'professor']
            );
            
            if (userResult.rows.length > 0) {
                const user = userResult.rows[0];
                console.log(`Found professor user:`, user.username);
                
                // Now find the professor record linked to this user
                // Try by email first, then by name matching
                let profResult = await client.query(
                    'SELECT professorid, email, professorname FROM public.professor WHERE email = $1',
                    [user.email]
                );
                
                if (profResult.rows.length === 0) {
                    // Try by username match
                    profResult = await client.query(
                        'SELECT professorid, email, professorname FROM public.professor WHERE professorname = $1',
                        [user.username]
                    );
                }
                
                if (profResult.rows.length === 0) {
                    // Try by first + last name
                    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    if (fullName) {
                        profResult = await client.query(
                            'SELECT professorid, email, professorname FROM public.professor WHERE professorname = $1',
                            [fullName]
                        );
                    }
                }
                
                if (profResult.rows.length > 0) {
                    profId = profResult.rows[0].professorid;
                    console.log(`Found professor record with ID: ${profId}`);
                } else {
                    console.log(`No professor record found for user ${user.username}, returning empty courses`);
                    return res.status(200).json({ courses: [] });
                }
            } else {
                // Fallback: try direct lookup in professor table by email or name
                let profResult = await client.query(
                    'SELECT professorid, email, professorname FROM public.professor WHERE email = $1 OR professorname = $1',
                    [professorId]
                );
                
                if (profResult.rows.length > 0) {
                    profId = profResult.rows[0].professorid;
                    console.log(`Found professor by email/name with ID: ${profId}`);
                } else {
                    console.log(`No professor found for identifier: ${professorId}`);
                    return res.status(200).json({ courses: [] });
                }
            }
        } else {
            // Numeric ID - use directly
            profId = parseInt(professorId);
        }
        
        // Query courses for this professor - using the exact schema structure
        // Reference: course.professorid -> professor.professorid
        const query = `
            SELECT 
                c.courseid, 
                c.course_name, 
                c.semester, 
                c.class_time,
                COUNT(DISTINCT sc.studentid) as student_count
            FROM public.course c
            LEFT JOIN public.student_course sc ON c.courseid = sc.courseid
            WHERE c.professorid = $1
            GROUP BY c.courseid, c.course_name, c.semester, c.class_time
            ORDER BY c.semester DESC, c.course_name;
        `;
        
        console.log(`Querying courses for professorid: ${profId}`);
        
        // First, verify professor exists
        const profCheck = await client.query('SELECT professorid, email, professorname FROM public.professor WHERE professorid = $1', [profId]);
        console.log(`Professor check for ID ${profId}:`, profCheck.rows.length > 0 ? profCheck.rows[0] : 'NOT FOUND');
        
        // Check all courses in database
        const allCourses = await client.query('SELECT courseid, course_name, professorid FROM public.course');
        console.log(`Total courses in database: ${allCourses.rows.length}`);
        if (allCourses.rows.length > 0) {
            console.log('All courses:', JSON.stringify(allCourses.rows, null, 2));
        }
        
        const result = await client.query(query, [profId]);
        
        console.log(`Found ${result.rows.length} courses for professor ${profId}`);
        if (result.rows.length > 0) {
            console.log('Courses:', JSON.stringify(result.rows, null, 2));
        } else {
            // Debug: check if there are any courses at all for this professor
            const debugQuery = await client.query(
                'SELECT courseid, course_name, professorid FROM public.course WHERE professorid = $1',
                [profId]
            );
            console.log(`Debug: Found ${debugQuery.rows.length} courses (without join) for professor ${profId}`);
            if (debugQuery.rows.length > 0) {
                console.log('Raw courses:', JSON.stringify(debugQuery.rows, null, 2));
            }
        }
        
        res.status(200).json({ courses: result.rows });
        
    } catch (err) {
        console.error('Get professor courses error:', err.stack);
        res.status(500).json({ message: 'Failed to fetch courses' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Delete Course (DELETE) ---
// ---------------------------------------------
app.delete('/api/courses/:courseId', async (req, res) => {
    const { courseId } = req.params;
    
    console.log(`[DELETE COURSE] Attempting to delete course ID: ${courseId}`);
    
    if (!courseId || isNaN(courseId)) {
        console.log(`[DELETE COURSE] Invalid course ID: ${courseId}`);
        return res.status(400).json({ message: 'Valid course ID is required' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        
        console.log(`[DELETE COURSE] Transaction started for course ${courseId}`);
        
        // Verify course exists
        const courseCheck = await client.query(
            'SELECT courseid, professorid, course_name FROM public.course WHERE courseid = $1',
            [courseId]
        );
        
        if (courseCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            console.log(`[DELETE COURSE] Course ${courseId} not found`);
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const course = courseCheck.rows[0];
        console.log(`[DELETE COURSE] Found course: ${course.course_name} (ID: ${course.courseid})`);
        
        // Delete related records in order (respecting foreign key constraints)
        // 1. Get group IDs first before deleting student_group entries
        console.log(`[DELETE COURSE] Step 1: Getting group IDs for course ${courseId}`);
        const groupIds = await client.query(
            'SELECT DISTINCT groupid FROM public.student_group WHERE courseid = $1',
            [courseId]
        );
        console.log(`[DELETE COURSE] Found ${groupIds.rows.length} groups associated with course`);
        
        // 2. Delete student_group entries for this course
        console.log(`[DELETE COURSE] Step 2: Deleting student_group entries for course ${courseId}`);
        const deleteStudentGroupResult = await client.query(
            'DELETE FROM public.student_group WHERE courseid = $1',
            [courseId]
        );
        console.log(`[DELETE COURSE] Deleted ${deleteStudentGroupResult.rowCount} student_group entries`);
        
        // 3. Delete groups that are only associated with this course
        console.log(`[DELETE COURSE] Step 3: Cleaning up orphaned groups`);
        for (const row of groupIds.rows) {
            const groupId = row.groupid;
            if (!groupId) {
                console.log(`[DELETE COURSE] Skipping null groupId`);
                continue;
            }
            
            // Check if group is used in other courses (now that we've deleted this course's entries)
            const otherCourses = await client.query(
                'SELECT COUNT(*) FROM public.student_group WHERE groupid = $1',
                [groupId]
            );
            
            const count = parseInt(otherCourses.rows[0].count);
            console.log(`[DELETE COURSE] Group ${groupId} is used in ${count} other courses`);
            
            if (count === 0) {
                // Group is not used in any other courses, safe to delete
                console.log(`[DELETE COURSE] Deleting orphaned group ${groupId}`);
                await client.query(
                    'DELETE FROM public."group" WHERE groupid = $1',
                    [groupId]
                );
                console.log(`[DELETE COURSE] Deleted group ${groupId}`);
            }
        }
        
        // 4. Delete student_course entries for this course
        console.log(`[DELETE COURSE] Step 4: Deleting student_course entries for course ${courseId}`);
        const deleteStudentCourseResult = await client.query(
            'DELETE FROM public.student_course WHERE courseid = $1',
            [courseId]
        );
        console.log(`[DELETE COURSE] Deleted ${deleteStudentCourseResult.rowCount} student_course entries`);
        
        // 5. Finally, delete the course itself
        console.log(`[DELETE COURSE] Step 5: Deleting course ${courseId}`);
        const deleteCourseResult = await client.query(
            'DELETE FROM public.course WHERE courseid = $1',
            [courseId]
        );
        console.log(`[DELETE COURSE] Course deletion result: ${deleteCourseResult.rowCount} rows affected`);
        
        await client.query('COMMIT');
        
        console.log(`[DELETE COURSE] SUCCESS: Course ${courseId} (${course.course_name}) deleted successfully`);
        
        res.status(200).json({ 
            message: 'Course deleted successfully',
            courseId: parseInt(courseId)
        });
        
    } catch (err) {
        if (client) {
            await client.query('ROLLBACK').catch(rollbackErr => {
                console.error('[DELETE COURSE] Rollback error:', rollbackErr);
            });
        }
        console.error('[DELETE COURSE] ERROR:', err.message);
        console.error('[DELETE COURSE] ERROR Stack:', err.stack);
        console.error('[DELETE COURSE] ERROR Code:', err.code);
        console.error('[DELETE COURSE] ERROR Detail:', err.detail);
        
        res.status(500).json({ 
            message: 'Failed to delete course',
            error: err.message,
            detail: err.detail || null
        });
    } finally {
        if (client) {
            client.release();
            console.log(`[DELETE COURSE] Database connection released`);
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Get Course (GET) ---
// ---------------------------------------------
app.get('/api/courses/:courseId', async (req, res) => {
    const { courseId } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        const query = `
            SELECT courseid, professorid, course_name, semester, class_time
            FROM public.course
            WHERE courseid = $1;
        `;
        
        const result = await client.query(query, [courseId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.status(200).json({ course: result.rows[0] });
        
    } catch (err) {
        console.error('Get course error:', err.stack);
        res.status(500).json({ message: 'Failed to fetch course' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Get Course Roster (GET) ---
// ---------------------------------------------
app.get('/api/courses/:courseId/roster', async (req, res) => {
    const { courseId } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        const query = `
            SELECT s.studentid, s.studentname, sg.groupid
            FROM public.student_course sc
            JOIN public.student s ON sc.studentid = s.studentid
            LEFT JOIN public.student_group sg ON sc.studentid = sg.studentid AND sg.courseid = $1
            WHERE sc.courseid = $1
            ORDER BY s.studentname;
        `;
        
        const result = await client.query(query, [courseId]);
        
        res.status(200).json({ roster: result.rows });
        
    } catch (err) {
        console.error('Get roster error:', err.stack);
        res.status(500).json({ message: 'Failed to fetch roster' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Upload Course Roster CSV (POST) ---
// ---------------------------------------------
app.post('/api/courses/:courseId/upload-roster', upload.single('csvFile'), async (req, res) => {
    const { courseId } = req.params;
    
    if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    let client;
    const results = [];
    const errors = [];

    try {
        client = await pool.connect();
        
        // Verify course exists
        const courseCheck = await client.query('SELECT courseid FROM public.course WHERE courseid = $1', [courseId]);
        if (courseCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
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

                    // Insert students into database and link to course
                    for (const student of results) {
                        try {
                            await client.query('BEGIN');
                            
                            // Check if student already exists
                            let studentResult = await client.query(
                                'SELECT studentid FROM public.student WHERE studentname = $1',
                                [student.name]
                            );

                            let studentId;
                            if (studentResult.rows.length === 0) {
                                // Create new student
                                const insertStudent = await client.query(
                                    'INSERT INTO public.student (studentname) VALUES ($1) RETURNING studentid',
                                    [student.name]
                                );
                                studentId = insertStudent.rows[0].studentid;
                            } else {
                                studentId = studentResult.rows[0].studentid;
                            }

                            // Check if student is already in this course
                            const courseCheck = await client.query(
                                'SELECT studentid FROM public.student_course WHERE courseid = $1 AND studentid = $2',
                                [courseId, studentId]
                            );

                            if (courseCheck.rows.length > 0) {
                                duplicateCount++;
                                await client.query('ROLLBACK');
                                continue;
                            }

                            // Link student to course
                            await client.query(
                                'INSERT INTO public.student_course (courseid, studentid) VALUES ($1, $2)',
                                [courseId, studentId]
                            );
                            
                            await client.query('COMMIT');
                            successCount++;
                        } catch (err) {
                            await client.query('ROLLBACK');
                            errors.push(`Error processing ${student.name}: ${err.message}`);
                        }
                    }

                    // Clean up uploaded file
                    fs.unlinkSync(req.file.path);

                    res.status(200).json({
                        message: 'CSV processing completed',
                        successCount,
                        duplicateCount,
                        errorCount: errors.length,
                        errors: errors.slice(0, 10)
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
// --- API Endpoint: Create Group (POST) ---
// ---------------------------------------------
app.post('/api/courses/:courseId/groups', async (req, res) => {
    const { courseId } = req.params;
    const { groupName } = req.body;
    
    if (!groupName || !groupName.trim()) {
        return res.status(400).json({ message: 'Group name is required' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Verify course exists
        const courseCheck = await client.query('SELECT courseid FROM public.course WHERE courseid = $1', [courseId]);
        if (courseCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const insertQuery = `
            INSERT INTO public."group" (group_name)
            VALUES ($1)
            RETURNING groupid, group_name;
        `;
        
        const result = await client.query(insertQuery, [groupName.trim()]);
        const newGroup = result.rows[0];
        
        res.status(201).json({
            message: 'Group created successfully',
            group: newGroup
        });
        
    } catch (err) {
        console.error('Create group error:', err.stack);
        res.status(500).json({ message: 'Failed to create group' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Get Course Groups (GET) ---
// ---------------------------------------------
app.get('/api/courses/:courseId/groups', async (req, res) => {
    const { courseId } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Get all groups and count students in each for this course
        const query = `
            SELECT g.groupid, g.group_name,
                   COUNT(sg.studentid) as student_count
            FROM public."group" g
            LEFT JOIN public.student_group sg ON g.groupid = sg.groupid AND sg.courseid = $1
            GROUP BY g.groupid, g.group_name
            ORDER BY g.group_name;
        `;
        
        const result = await client.query(query, [courseId]);
        
        res.status(200).json({ groups: result.rows });
        
    } catch (err) {
        console.error('Get groups error:', err.stack);
        res.status(500).json({ message: 'Failed to fetch groups' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Add Students to Group (POST) ---
// ---------------------------------------------
app.post('/api/courses/:courseId/groups/:groupId/students', async (req, res) => {
    const { courseId, groupId } = req.params;
    const { studentIds } = req.body;
    
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: 'Student IDs array is required' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        
        await client.query('BEGIN');
        
        // Verify course and group exist
        const courseCheck = await client.query('SELECT courseid FROM public.course WHERE courseid = $1', [courseId]);
        if (courseCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const groupCheck = await client.query('SELECT groupid FROM public."group" WHERE groupid = $1', [groupId]);
        if (groupCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Group not found' });
        }
        
        let successCount = 0;
        let duplicateCount = 0;
        
        // Add each student to the group
        for (const studentId of studentIds) {
            try {
                // Check if student is already in this group for this course
                const existing = await client.query(
                    'SELECT studentid FROM public.student_group WHERE courseid = $1 AND groupid = $2 AND studentid = $3',
                    [courseId, groupId, studentId]
                );
                
                if (existing.rows.length > 0) {
                    duplicateCount++;
                    continue;
                }
                
                // Verify student is in the course
                const inCourse = await client.query(
                    'SELECT studentid FROM public.student_course WHERE courseid = $1 AND studentid = $2',
                    [courseId, studentId]
                );
                
                if (inCourse.rows.length === 0) {
                    continue; // Skip if student not in course
                }
                
                // Add student to group
                await client.query(
                    'INSERT INTO public.student_group (groupid, studentid, courseid) VALUES ($1, $2, $3)',
                    [groupId, studentId, courseId]
                );
                
                successCount++;
            } catch (err) {
                console.error(`Error adding student ${studentId}:`, err);
            }
        }
        
        await client.query('COMMIT');
        
        res.status(200).json({
            message: 'Students added to group',
            successCount,
            duplicateCount
        });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Add students to group error:', err.stack);
        res.status(500).json({ message: 'Failed to add students to group' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Get Students in Group (GET) ---
// ---------------------------------------------
app.get('/api/courses/:courseId/groups/:groupId/students', async (req, res) => {
    const { courseId, groupId } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        const query = `
            SELECT s.studentid, s.studentname, s.email
            FROM public.student_group sg
            JOIN public.student s ON sg.studentid = s.studentid
            WHERE sg.courseid = $1 AND sg.groupid = $2
            ORDER BY s.studentname;
        `;
        
        const result = await client.query(query, [courseId, groupId]);
        
        res.status(200).json({
            students: result.rows
        });
        
    } catch (err) {
        console.error('Get group students error:', err.stack);
        res.status(500).json({ message: 'Failed to fetch group students' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Remove Student from Group (DELETE) ---
// ---------------------------------------------
app.delete('/api/courses/:courseId/groups/:groupId/students/:studentId', async (req, res) => {
    const { courseId, groupId, studentId } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Verify the student is in this group for this course
        const checkQuery = await client.query(
            'SELECT studentid FROM public.student_group WHERE courseid = $1 AND groupid = $2 AND studentid = $3',
            [courseId, groupId, studentId]
        );
        
        if (checkQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found in this group' });
        }
        
        // Remove student from group
        await client.query(
            'DELETE FROM public.student_group WHERE courseid = $1 AND groupid = $2 AND studentid = $3',
            [courseId, groupId, studentId]
        );
        
        res.status(200).json({
            message: 'Student removed from group successfully'
        });
        
    } catch (err) {
        console.error('Remove student from group error:', err.stack);
        res.status(500).json({ message: 'Failed to remove student from group' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ============================================
// EVALUATION ASSIGNMENT ENDPOINTS
// ============================================

// ---------------------------------------------
// --- API Endpoint: Create Evaluation Assignment (POST) ---
// ---------------------------------------------
app.post('/api/evaluation-assignments', async (req, res) => {
    const { courseId, groupId, evaluatorStudentIds, dueDate, assignmentName, points, availableFrom, until } = req.body;
    
    console.log('[CREATE ASSIGNMENT] Request received:', {
        courseId,
        groupId,
        evaluatorStudentIds: evaluatorStudentIds?.length || 0,
        dueDate,
        assignmentName,
        points
    });
    
    if (!courseId || !groupId || !Array.isArray(evaluatorStudentIds) || evaluatorStudentIds.length === 0) {
        console.log('[CREATE ASSIGNMENT] Validation failed:', {
            courseId: !!courseId,
            groupId: !!groupId,
            evaluatorStudentIds: Array.isArray(evaluatorStudentIds),
            evaluatorStudentIdsLength: evaluatorStudentIds?.length || 0
        });
        return res.status(400).json({ message: 'Course ID, Group ID, and at least one evaluator student ID are required' });
    }
    
    if (!dueDate) {
        console.log('[CREATE ASSIGNMENT] Due date missing');
        return res.status(400).json({ message: 'Due date is required' });
    }
    
    let client;
    
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        
        // Verify course and group exist
        const courseCheck = await client.query('SELECT courseid FROM public.course WHERE courseid = $1', [courseId]);
        if (courseCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            console.log('[CREATE ASSIGNMENT] Course not found:', courseId);
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const groupCheck = await client.query('SELECT groupid FROM public.group WHERE groupid = $1', [groupId]);
        if (groupCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            console.log('[CREATE ASSIGNMENT] Group not found:', groupId);
            return res.status(404).json({ message: 'Group not found' });
        }
        
        console.log('[CREATE ASSIGNMENT] Course and group verified');
        
        // Create evaluation assignment record
        // First, check if evaluation_assignments table exists, if not we'll create it via SQL
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS public.evaluation_assignments (
                assignmentid SERIAL PRIMARY KEY,
                courseid INTEGER NOT NULL REFERENCES public.course(courseid) ON DELETE CASCADE,
                groupid INTEGER NOT NULL REFERENCES public.group(groupid) ON DELETE CASCADE,
                evaluator_studentid INTEGER NOT NULL REFERENCES public.student(studentid) ON DELETE CASCADE,
                due_date TIMESTAMP NOT NULL,
                assignment_name VARCHAR(255),
                points INTEGER DEFAULT 0,
                available_from TIMESTAMP,
                available_until TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                UNIQUE(courseid, groupid, evaluator_studentid)
            );
        `;
        
        await client.query(createTableQuery);
        
        const assignments = [];
        const errors = [];
        
        // Create assignment for each evaluator
        console.log(`[CREATE ASSIGNMENT] Processing ${evaluatorStudentIds.length} evaluator(s)`);
        
        for (const evaluatorStudentId of evaluatorStudentIds) {
            try {
                console.log(`[CREATE ASSIGNMENT] Processing student ${evaluatorStudentId}`);
                
                // First, verify student exists
                const studentExists = await client.query(
                    'SELECT studentid, studentname FROM public.student WHERE studentid = $1',
                    [evaluatorStudentId]
                );
                
                if (studentExists.rows.length === 0) {
                    const errorMsg = `Student ${evaluatorStudentId} does not exist`;
                    console.log(`[CREATE ASSIGNMENT] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }
                
                // Verify student is enrolled in the course, if not, auto-enroll them
                let studentCheck = await client.query(
                    'SELECT studentid FROM public.student_course WHERE courseid = $1 AND studentid = $2',
                    [courseId, evaluatorStudentId]
                );
                
                if (studentCheck.rows.length === 0) {
                    console.log(`[CREATE ASSIGNMENT] Student ${evaluatorStudentId} not enrolled, auto-enrolling...`);
                    try {
                        await client.query(
                            'INSERT INTO public.student_course (courseid, studentid) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                            [courseId, evaluatorStudentId]
                        );
                        console.log(`[CREATE ASSIGNMENT] Successfully enrolled student ${evaluatorStudentId} in course ${courseId}`);
                        // Re-check enrollment
                        studentCheck = await client.query(
                            'SELECT studentid FROM public.student_course WHERE courseid = $1 AND studentid = $2',
                            [courseId, evaluatorStudentId]
                        );
                    } catch (enrollErr) {
                        const errorMsg = `Student ${evaluatorStudentId} (${studentExists.rows[0].studentname}) is not enrolled in this course and could not be auto-enrolled: ${enrollErr.message}`;
                        console.log(`[CREATE ASSIGNMENT] ${errorMsg}`);
                        errors.push(errorMsg);
                        continue;
                    }
                }
                
                // Check if assignment already exists
                const existingCheck = await client.query(
                    'SELECT assignmentid FROM public.evaluation_assignments WHERE courseid = $1 AND groupid = $2 AND evaluator_studentid = $3',
                    [courseId, groupId, evaluatorStudentId]
                );
                
                if (existingCheck.rows.length > 0) {
                    const errorMsg = `Assignment already exists for student ${evaluatorStudentId} (${studentExists.rows[0].studentname})`;
                    console.log(`[CREATE ASSIGNMENT] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }
                
                // Insert assignment
                const insertQuery = `
                    INSERT INTO public.evaluation_assignments (courseid, groupid, evaluator_studentid, due_date, assignment_name, points, available_from, available_until)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING assignmentid, courseid, groupid, evaluator_studentid, due_date, assignment_name, points, available_from, available_until, created_at
                `;
                
                console.log(`[CREATE ASSIGNMENT] Inserting assignment for student ${evaluatorStudentId}`, {
                    courseId,
                    groupId,
                    dueDate,
                    assignmentName,
                    points
                });
                
                const result = await client.query(insertQuery, [
                    courseId,
                    groupId,
                    evaluatorStudentId,
                    dueDate,
                    assignmentName || null,
                    points || 0,
                    availableFrom || null,
                    until || null
                ]);
                
                console.log(`[CREATE ASSIGNMENT] Successfully created assignment ${result.rows[0].assignmentid} for student ${evaluatorStudentId}`);
                assignments.push(result.rows[0]);
            } catch (err) {
                console.error(`[CREATE ASSIGNMENT] Error creating assignment for student ${evaluatorStudentId}:`, err);
                console.error(`[CREATE ASSIGNMENT] Error stack:`, err.stack);
                console.error(`[CREATE ASSIGNMENT] Error code:`, err.code);
                console.error(`[CREATE ASSIGNMENT] Error detail:`, err.detail);
                errors.push(`Failed to create assignment for student ${evaluatorStudentId}: ${err.message}${err.detail ? ` (${err.detail})` : ''}`);
            }
        }
        
        console.log(`[CREATE ASSIGNMENT] Results: ${assignments.length} created, ${errors.length} errors`);
        
        if (assignments.length === 0) {
            await client.query('ROLLBACK');
            console.log('[CREATE ASSIGNMENT] Rolling back transaction - no assignments created');
            console.log('[CREATE ASSIGNMENT] Errors:', errors);
            return res.status(400).json({ 
                message: 'Failed to create any assignments',
                errors: errors,
                details: 'Check server logs for more information'
            });
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({
            message: `Successfully created ${assignments.length} assignment(s)`,
            assignments: assignments,
            errors: errors.length > 0 ? errors : undefined
        });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create evaluation assignment error:', err.stack);
        res.status(500).json({ message: 'Failed to create evaluation assignment', error: err.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Get Evaluation Assignments for Course (GET) ---
// ---------------------------------------------
app.get('/api/courses/:courseId/evaluation-assignments', async (req, res) => {
    const { courseId } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        // Check if table exists first
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'evaluation_assignments'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            return res.status(200).json({ assignments: [] });
        }
        
        const query = `
            SELECT 
                ea.assignmentid,
                ea.courseid,
                ea.groupid,
                ea.evaluator_studentid,
                ea.due_date,
                ea.assignment_name,
                ea.points,
                ea.available_from,
                ea.available_until,
                ea.created_at,
                ea.completed_at,
                s.studentname as evaluator_name,
                s.email as evaluator_email,
                g.group_name,
                c.course_name,
                CASE 
                    WHEN ea.completed_at IS NOT NULL THEN 'completed'
                    WHEN ea.due_date < CURRENT_TIMESTAMP THEN 'overdue'
                    ELSE 'pending'
                END as status
            FROM public.evaluation_assignments ea
            JOIN public.student s ON ea.evaluator_studentid = s.studentid
            JOIN public.group g ON ea.groupid = g.groupid
            JOIN public.course c ON ea.courseid = c.courseid
            WHERE ea.courseid = $1
            ORDER BY ea.due_date ASC, s.studentname ASC
        `;
        
        const result = await client.query(query, [courseId]);
        
        res.status(200).json({ assignments: result.rows });
        
    } catch (err) {
        console.error('Get evaluation assignments error:', err.stack);
        res.status(500).json({ message: 'Failed to fetch evaluation assignments', error: err.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Get Evaluation Assignments for Student (GET) ---
// ---------------------------------------------
app.get('/api/students/:studentEmail/evaluation-assignments', async (req, res) => {
    const { studentEmail } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        // First, try to find user account by email
        const userResult = await client.query(
            'SELECT id, email, username, first_name, last_name FROM public.users WHERE email = $1 AND role = $2 LIMIT 1',
            [studentEmail, 'student']
        );
        
        let studentId = null;
        
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            
            // Try to find student record linked to this user account
            // First, check if student table has a user_id column (new approach)
            const hasUserIdColumn = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'student' 
                AND column_name = 'user_id'
            `);
            
            if (hasUserIdColumn.rows.length > 0) {
                // Use direct user_id link
                const studentByUserId = await client.query(
                    'SELECT studentid, studentname, email FROM public.student WHERE user_id = $1 LIMIT 1',
                    [user.id]
                );
                
                if (studentByUserId.rows.length > 0) {
                    studentId = studentByUserId.rows[0].studentid;
                } else {
                    // Try to find by email and link it
                    let studentByEmail = await client.query(
                        'SELECT studentid, studentname, email FROM public.student WHERE email = $1 LIMIT 1',
                        [user.email]
                    );
                    
                    if (studentByEmail.rows.length > 0) {
                        // Link the student record to the user account
                        await client.query(
                            'UPDATE public.student SET user_id = $1, email = $2 WHERE studentid = $3',
                            [user.id, user.email, studentByEmail.rows[0].studentid]
                        );
                        studentId = studentByEmail.rows[0].studentid;
                    } else {
                        // Try to find by name matching
                        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                        if (fullName) {
                            studentByEmail = await client.query(
                                'SELECT studentid, studentname, email FROM public.student WHERE studentname ILIKE $1 LIMIT 1',
                                [`%${fullName}%`]
                            );
                            
                            if (studentByEmail.rows.length > 0) {
                                // Link and update email
                                await client.query(
                                    'UPDATE public.student SET user_id = $1, email = $2 WHERE studentid = $3',
                                    [user.id, user.email, studentByEmail.rows[0].studentid]
                                );
                                studentId = studentByEmail.rows[0].studentid;
                            }
                        }
                    }
                }
            } else {
                // Fallback to email matching (old approach)
                let studentResult = await client.query(
                    'SELECT studentid, studentname, email FROM public.student WHERE email = $1 LIMIT 1',
                    [user.email]
                );
                
                if (studentResult.rows.length === 0) {
                    // Try name matching
                    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    if (fullName) {
                        studentResult = await client.query(
                            'SELECT studentid, studentname, email FROM public.student WHERE studentname ILIKE $1 LIMIT 1',
                            [`%${fullName}%`]
                        );
                    }
                    
                    if (studentResult.rows.length > 0) {
                        // Update student with email
                        await client.query(
                            'UPDATE public.student SET email = $1 WHERE studentid = $2',
                            [user.email, studentResult.rows[0].studentid]
                        );
                    }
                }
                
                if (studentResult.rows.length > 0) {
                    studentId = studentResult.rows[0].studentid;
                }
            }
        } else {
            // No user account found - try direct student lookup by email
            const studentResult = await client.query(
                'SELECT studentid, studentname, email FROM public.student WHERE email = $1 LIMIT 1',
                [studentEmail]
            );
            
            if (studentResult.rows.length > 0) {
                studentId = studentResult.rows[0].studentid;
            }
        }
        
        if (!studentId) {
            return res.status(200).json({ assignments: [] });
        }
        
        // Check if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'evaluation_assignments'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            return res.status(200).json({ assignments: [] });
        }
        
        // Ensure student table has user_id column (add if missing)
        try {
            await client.query(`
                ALTER TABLE public.student 
                ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL
            `);
        } catch (err) {
            // Column might already exist, ignore error
            console.log('Note: user_id column check:', err.message);
        }
        
        // Get assignments for this student
        const query = `
            SELECT 
                ea.assignmentid,
                ea.courseid,
                ea.groupid,
                ea.evaluator_studentid,
                ea.due_date,
                ea.assignment_name,
                ea.points,
                ea.available_from,
                ea.available_until,
                ea.created_at,
                ea.completed_at,
                g.group_name,
                c.course_name,
                c.semester,
                p.professorname,
                CASE 
                    WHEN ea.completed_at IS NOT NULL THEN 'completed'
                    WHEN ea.due_date < CURRENT_TIMESTAMP THEN 'overdue'
                    WHEN ea.available_from IS NOT NULL AND ea.available_from > CURRENT_TIMESTAMP THEN 'not_available'
                    WHEN ea.available_until IS NOT NULL AND ea.available_until < CURRENT_TIMESTAMP THEN 'expired'
                    ELSE 'pending'
                END as status
            FROM public.evaluation_assignments ea
            JOIN public.group g ON ea.groupid = g.groupid
            JOIN public.course c ON ea.courseid = c.courseid
            JOIN public.professor p ON c.professorid = p.professorid
            WHERE ea.evaluator_studentid = $1
            ORDER BY 
                CASE 
                    WHEN ea.completed_at IS NULL AND ea.due_date < CURRENT_TIMESTAMP THEN 1
                    WHEN ea.completed_at IS NULL THEN 2
                    ELSE 3
                END,
                ea.due_date ASC
        `;
        
        const result = await client.query(query, [studentId]);
        
        res.status(200).json({ assignments: result.rows });
        
    } catch (err) {
        console.error('Get student evaluation assignments error:', err.stack);
        res.status(500).json({ message: 'Failed to fetch evaluation assignments', error: err.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Mark Assignment as Completed (PATCH) ---
// ---------------------------------------------
app.patch('/api/evaluation-assignments/:assignmentId/complete', async (req, res) => {
    const { assignmentId } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        const updateQuery = `
            UPDATE public.evaluation_assignments
            SET completed_at = CURRENT_TIMESTAMP
            WHERE assignmentid = $1
            RETURNING assignmentid, completed_at
        `;
        
        const result = await client.query(updateQuery, [assignmentId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        
        res.status(200).json({ 
            message: 'Assignment marked as completed',
            assignment: result.rows[0]
        });
        
    } catch (err) {
        console.error('Mark assignment complete error:', err.stack);
        res.status(500).json({ message: 'Failed to mark assignment as completed', error: err.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// ---------------------------------------------
// --- API Endpoint: Delete Evaluation Assignment (DELETE) ---
// ---------------------------------------------
app.delete('/api/evaluation-assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;
    
    let client;
    
    try {
        client = await pool.connect();
        
        const deleteQuery = 'DELETE FROM public.evaluation_assignments WHERE assignmentid = $1 RETURNING assignmentid';
        const result = await client.query(deleteQuery, [assignmentId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        
        res.status(200).json({ message: 'Assignment deleted successfully' });
        
    } catch (err) {
        console.error('Delete evaluation assignment error:', err.stack);
        res.status(500).json({ message: 'Failed to delete assignment', error: err.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.use(express.static(path.join(__dirname, '../frontend-clean/build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend-clean/build', 'index.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log('Teammate fetch API ready at /api/teammates');
});