const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        const { date, cravings } = req.body;

        // Uses environment variables for security
        const gmailUser = process.env.GMAIL_USER || 'sbasharat577@gmail.com';
        const gmailPass = process.env.GMAIL_PASS;

        if (!gmailPass) {
            return res.status(500).json({ success: false, message: 'Server configuration error: Email credentials missing.' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass
            }
        });

        const mailOptions = {
            from: gmailUser,
            to: gmailUser,
            subject: 'Birthday Celebration Date Planned! 🎂✨',
            text: `Hey! I planned our Birthday Date! 🎂\n\n📅 When: ${date}\n🍔 Cravings: ${cravings}\n\nPlanned with love. Something wonderful awaits! 💖`
        };

        try {
            console.log(`Connecting to Gmail SMTP for ${gmailUser} via Vercel...`);
            await transporter.sendMail(mailOptions);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('SMTP serverless error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
