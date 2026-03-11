// config.js - Load environment variables
const config = require('./config');
const multer = require('multer');
const path = require('path');

const express = require('express');
const app = express();
const PORT = config.SERVER.PORT;

// Configure multer for image uploads
const fs = require('fs');

// Ensure product-images directory exists
const productImagesDir = path.join(__dirname, 'WebPage', 'product-images');
if (!fs.existsSync(productImagesDir)){
    fs.mkdirSync(productImagesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'WebPage/product-images/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Middleware - JSON parsing
app.use(express.json());

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

// ============================================
// ADMIN LOGIN API ENDPOINT
// ============================================

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // Check credentials using the config helper function
  const validUser = config.checkAdminCredentials(username, password);
  
  if (validUser) {
    // Generate a simple token
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    res.json({ 
      success: true, 
      token: token,
      username: username
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Verify admin token
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // In production, verify token properly
  // For now, just check if token exists and is valid format
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length >= 1 && parts[0] === config.ADMIN.username) {
      res.json({ valid: true, username: parts[0] });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ============================================
// PRODUCTS API ENDPOINTS
// ============================================

// Get all products
app.get('/api/products', (req, res) => {
  res.json(config.getProducts());
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = config.getProductById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Add new product
app.post('/api/products', (req, res) => {
  const { name, category, actualMRP, priceAfterDiscount, stock, description, image, isNew, isSale, isNewLaunch } = req.body;
  
  if (!name || !category || !actualMRP) {
    return res.status(400).json({ error: 'Name, category, and Actual Product MRP are required' });
  }
  
  const newProduct = config.addProduct({
    name,
    category,
    actualMRP: parseFloat(actualMRP),
    priceAfterDiscount: priceAfterDiscount ? parseFloat(priceAfterDiscount) : null,
    stock: parseInt(stock) || 0,
    description: description || '',
    image: image || 'https://via.placeholder.com/300x250?text=Product+Image',
    isNew: isNew || false,
    isSale: isSale || false,
    isNewLaunch: isNewLaunch || false
  });
  
  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const { name, category, actualMRP, priceAfterDiscount, stock, description, image, isNew, isSale, isNewLaunch } = req.body;
  
  const updatedProduct = config.updateProduct(req.params.id, {
    ...(name && { name }),
    ...(category && { category }),
    ...(actualMRP && { actualMRP: parseFloat(actualMRP) }),
    ...(priceAfterDiscount !== undefined && { priceAfterDiscount: priceAfterDiscount ? parseFloat(priceAfterDiscount) : null }),
    ...(stock !== undefined && { stock: parseInt(stock) }),
    ...(description !== undefined && { description }),
    ...(image && { image }),
    ...(isNew !== undefined && { isNew }),
    ...(isSale !== undefined && { isSale }),
    ...(isNewLaunch !== undefined && { isNewLaunch })
  });
  
  if (updatedProduct) {
    res.json(updatedProduct);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const success = config.deleteProduct(req.params.id);
  if (success) {
    res.json({ message: 'Product deleted successfully' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Upload image endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const imageUrl = '/product-images/' + req.file.filename;
  res.json({ 
    success: true, 
    imageUrl: imageUrl 
  });
}, (error, req, res, next) => {
  res.status(400).json({ error: error.message });
});

// ============================================
// CATEGORIES API ENDPOINTS
// ============================================

// Get all categories
app.get('/api/categories', (req, res) => {
  res.json(config.getCategories());
});

// Add new category
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  
  const newCategory = config.addCategory(name);
  
  if (newCategory) {
    res.status(201).json(newCategory);
  } else {
    res.status(400).json({ error: 'Category already exists' });
  }
});

// Delete category
app.delete('/api/categories/:name', (req, res) => {
  const success = config.deleteCategory(req.params.name);
  if (success) {
    res.json({ message: 'Category deleted successfully' });
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// ============================================
// BADGES API ENDPOINTS
// ============================================

// Get all badges
app.get('/api/badges', (req, res) => {
  res.json(config.getBadges());
});

// Add new badge
app.post('/api/badges', (req, res) => {
  const { id, name, label, color, backgroundColor, textColor, icon, priority } = req.body;
  
  if (!name || !label) {
    return res.status(400).json({ error: 'Badge name and label are required' });
  }
  
  const newBadge = config.addBadge({
    id,
    name,
    label,
    color,
    backgroundColor,
    textColor,
    icon,
    priority
  });
  
  if (newBadge) {
    res.status(201).json(newBadge);
  } else {
    res.status(400).json({ error: 'Badge already exists' });
  }
});

// Update badge
app.put('/api/badges/:id', (req, res) => {
  const updatedBadge = config.updateBadge(req.params.id, req.body);
  
  if (updatedBadge) {
    res.json(updatedBadge);
  } else {
    res.status(404).json({ error: 'Badge not found' });
  }
});

// Delete badge
app.delete('/api/badges/:id', (req, res) => {
  const success = config.deleteBadge(req.params.id);
  if (success) {
    res.json({ message: 'Badge deleted successfully' });
  } else {
    res.status(404).json({ error: 'Badge not found' });
  }
});

// ============================================
// STATIC FILES - Must be AFTER API routes
// ============================================
app.use(express.static('WebPage'));

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
        <a href="/" style="color: #f1c40f; text-decoration: none; font-weight: bold; border: 1px solid #f1c40f; padding: 10px 20px; border-radius: 50px; display: inline-block; margin-top: 20px; transition: 0.3s;">
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

// This tells the server what to do when someone clicks your footer link
app.get('/WebPage/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'WebPage', 'index.html'));
});

// Serve index.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'WebPage', 'index.html'));
});

// Serve admin.html
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'WebPage', 'admin.html'));
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

