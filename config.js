// config.js - Central configuration file
// This file loads environment variables and provides them to the application

require('dotenv').config();

// Video URLs
const VIDEO_URLS = {
    MAIN: process.env.MAIN_VIDEO_URL || '',
    GALLERY_1: process.env.GALLERY_VIDEO_1_URL || '',
    GALLERY_2: process.env.GALLERY_VIDEO_2_URL || ''
};

// Thumbnail URLs
const THUMBNAIL_URLS = {
    GALLERY_1: process.env.GALLERY_THUMBNAIL_1 || ''
};

// Contact Information
const CONTACT = {
    WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '919548190094',
    WHATSAPP_MESSAGE: 'Hi%2C%20I%27m%20interested%20in%20your%20wedding%20video%20invitation%20services.',
    EMAIL: 'jnvhimanshu11@gmail.com',
    PHONE: '+919548190094'
};

// URLs
const URLs = {
    WEBSITE: process.env.WEBSITE_URL || 'https://thebohothread.in',
    MAIN_PAGE: process.env.MAIN_PAGE_URL || '/WebPage/web.html',
    WHATSAPP_API: `https://wa.me/${CONTACT.WHATSAPP_NUMBER}?text=${CONTACT.WHATSAPP_MESSAGE}`
};

// Server Configuration
const SERVER = {
    PORT: process.env.PORT || 3000
};

// Invite Data - Using environment variables
const INVITE_DATA = [
    { 
        id: "invitefamily.tech", 
        videoUrl: VIDEO_URLS.MAIN,
        title: "Let's Invite Family" 
    },
    { 
        id: "himanshu", 
        videoUrl: VIDEO_URLS.GALLERY_1,
        title: "Chopta Tour Vedio" 
    },
    { 
        id: "prachi", 
        videoUrl: VIDEO_URLS.GALLERY_2,
        title: "Prachi & Gaurav" 
    }
];

// Export all configurations
module.exports = {
    VIDEO_URLS,
    THUMBNAIL_URLS,
    CONTACT,
    URLs,
    SERVER,
    INVITE_DATA
};

