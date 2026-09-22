# Tee Studio v3 – React + Konva T-shirt designer

    npm install
    npm run dev       # open the printed local URL
    npm run build     # production build in /dist

- Default T-shirt images load from public/mockups/ (round-front.png and round-back.png included). Users can also upload their own T-shirt image for the front and back (PNG, JPG or WEBP).
- The print area is the T-shirt itself: designs cannot be dragged off the shirt and anything past its edge is trimmed. The printable PNG covers the whole shirt.
- Printable PNG = design only, transparent, cropped to the entire shirt and clipped to the shirt shape.
- T-shirt preview PNG = design on the shirt. ZIP = both files for front and back plus order details.
- Clipart and open SVG: search Iconify (open SVG icons, recolorable), Openclipart and Wikimedia Commons from the left panel (src/clipart.js).
- Uploaded artwork has an optional "Make background transparent" button. Text supports solid colours and gradients.
