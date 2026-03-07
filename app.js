// config.js - Load environment variables
const config = require('./config');

const express = require('express');
const app = express();
const PORT = config.SERVER.PORT;

// ADD THIS LINE HERE:
app.use(express.static('WebPage'));

const inviteData = config.INVITE_DATA;

app.get('/ping', (req, res) => {
  res.status(200).send('Server is alive ✅');
});

// API endpoint to serve configuration to client-side
app.get('/api/config', (req, res) => {
  res.json({
    VIDEO_URLS: config.VIDEO_URLS,
    THUMBNAIL_URLS: config.THUMBNAIL_URLS,
    CONTACT: config.CONTACT,
    URLs: config.URLs
  });
});

app.get('/v/:id', (req, res) => {
    const uniqueId = req.params.id;
    const invite = inviteData.find(item => item.id === uniqueId);

    if (invite) {
        res.send(`

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; }

        body { 
            background: radial-gradient(circle at top, #2c3e50 0%, #000000 100%); 
            color: white; 
            text-align: center; 
            font-family: "Kristen ITC", "Fredoka", "Comic Sans MS", sans-serif; 
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        h1 { 
            background: linear-gradient(180deg, #f1c40f 0%, #e67e22 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.5rem;
            margin: 20px 0;
            filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.5));
        }

        .video-card {
            position: relative;
            width: 100%;
            max-width: 400px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 30px;
            overflow: hidden;
            z-index: 1;
            box-shadow: 0px 20px 50px rgba(0,0,0,0.8);
        }

        .video-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(
                transparent, 
                #f1c40f,
                #0be92cff,
                #06efc8ff,
                #4c00fcff,
                #f1c40f,
                #e67e22, 
                transparent 30%
            );
            animation: rotateGradient 4s linear infinite;
            z-index: -2;
        }

        .video-card::after {
            content: '';
            position: absolute;
            inset: 8px;
            background: #111;
            border-radius: 26px;
            z-index: -1;
        }

        @keyframes rotateGradient {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        video { 
            width: 100%; 
            border-radius: 22px; 
            display: block;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
        }

        .glow-shadow {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            box-shadow: 0 0 30px rgba(241, 196, 15, 0.3);
            border-radius: 30px;
            pointer-events: none;
            animation: pulseShadow 2s ease-in-out infinite alternate;
        }

        @keyframes pulseShadow {
            from { opacity: 0.4; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1.02); }
        }

        p {
            font-size: 0.9rem;
            color: #bdc3c7;
            margin-top: 15px;
        }
    </style>
</head>
<body>

    <h1>${invite.title}</h1>

    <div class="video-card">
        <div class="glow-shadow"></div>
        <video controls autoplay muted playsinline>
            <source src="${invite.videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    </div>

    <p>
        <a href="/WebPage/web.html" style="color: #f1c40f; text-decoration: none; font-weight: bold; border: 1px solid #f1c40f; padding: 10px 20px; border-radius: 50px; display: inline-block; margin-top: 20px; transition: 0.3s;">
            Created By The Boho Thread 🏠
        </a>
    </p>

</body>

</html>

        `);

    } else {

        res.status(404).send(`

    <!DOCTYPE html>

    <html>

    <head>

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600&display=swap" rel="stylesheet">

        <style>

            body {
                margin: 0;
                padding: 0;
                background: radial-gradient(circle at top, #2c3e50 0%, #000000 100%);
                color: white;
                font-family: "Kristen ITC", "Fredoka", sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                text-align: center;
            }

            .error-container {
                padding: 20px;
                border-radius: 25px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                box-shadow: 0px 20px 40px rgba(0,0,0,0.5);
                max-width: 80%;
            }

            h1 {
                background: linear-gradient(180deg, #f1c40f 0%, #e67e22 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 2.2rem;
                margin: 0;
                filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.5));
            }

            p {
                color: #bdc3c7;
                margin-top: 15px;
                font-size: 1rem;
            }

        </style>

    </head>

    <body>

        <div class="error-container">

            <h1>Sorry! You Your Are Not Invited</h1>

            <p>This exclusive content is for invited guests only.</p>

            <span class="emoji">😔</span>

        </div>

    </body>

    </html>

`);

    }

});

const path = require('path');

// This tells the server what to do when someone clicks your footer link
app.get('/WebPage/web.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'WebPage', 'web.html'));
});


// Testing on local host

app.listen(PORT, () => {
    console.log(`Your server is alive! Go to: http://localhost:${PORT}/v/himanshu`);

    // 2. Start the Keep-Alive logic
    keepAlive();
});



// 3. The Keep-Alive Function
function keepAlive() {
    const url = `https://thebohothread.in/ping`; 
    
    setInterval(async () => {
        try {
            // Fetch is built into Node.js, no 'axios' needed!
            await fetch(url);
            console.log('Keep-alive ping sent 🚀');
        } catch (err) {
            console.error('Ping failed:', err.message);
        }
    }, 840000); // 14 minutes
}
