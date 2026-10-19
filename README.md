# Denno Butchery Chokaa – Website

A static website (HTML, CSS, JavaScript). No backend, database or paid service needed.

## Files
- `index.html` – page structure and text
- `style.css` – colours and layout (colours are at the top, in `:root`)
- `script.js` – settings, product list, basket, checkout and WhatsApp message
- `images/` – put your photos here

## 1. Create the folder and save the files
Create a folder called `denno-butcher`. Keep `index.html`, `style.css` and `script.js` together in it, with an `images` folder beside them.

## 2. Preview locally
Double-click `index.html`. It opens in your browser. Refresh after every change.

## 3. Change the phone number
- In `script.js`, change `WHATSAPP_NUMBER` (format: `254` + number without the leading 0, e.g. `254795410514`).
- In `index.html`, search for `0795410514` and `+254795410514` and replace them (contact section, footer, call links).

## 4. Change prices
In `script.js`, find `PRODUCTS`. Edit `price: 900` (goat, per kg) or `price: 500` (chicken, per whole chicken; it has `unit: "chicken"`). Set `available: false` to pause a product.

## 5. Set the liver price
Change `price: null` on the liver line to the number, e.g. `price: 700`. The "Contact us for today's price" text, the "to be confirmed" labels and the WhatsApp wording update automatically. (Remove the note "The price must be confirmed..." only if you wish; it shows only while price is `null`.)

## 6. Add or replace photos
Photos are not included, because they must be licensed for use. Download free-to-use photos from unsplash.com or pexels.com (check each photo's licence) and save them in `images/` as:
`hero.jpg` (wide shop/meat photo), `goat.jpg`, `chicken.jpg`, `liver.jpg`.
Use JPG files under about 300 KB each (shrink at squoosh.app). Keep the right meat on the right card. Until a photo exists, the card shows a neutral placeholder. Do not present stock photos as the real shop; add your own shop photos when you have them.
For social sharing, after publishing add this line in `<head>` of `index.html`, using your real address:
`<meta property="og:image" content="https://YOUR-SITE.netlify.app/images/hero.jpg">`

## 7. Publish free with Netlify Drop
1. Go to https://app.netlify.com/drop
2. Drag the whole `denno-butcher` folder onto the page.
3. Netlify gives you a web address. Create a free account to keep the site and rename it.

## 8. Test on a phone
Open the Netlify address on your phone. Add items, fill the form, tap **Send Order on WhatsApp** and check the message in WhatsApp (do not send unless you want to).

## 9. Update the site
Change the files, then in Netlify open your site → **Deploys** → drag the updated folder onto the deploy area.

## Test checklist
- [ ] Menu opens and closes on a phone
- [ ] Goat shows KSh 900/kg, chicken KSh 500/kg, liver shows "Contact us for today's price"
- [ ] Quantities: 0.5, 1, 2 accepted; 0, -1, blank, text rejected
- [ ] Remove button and quantity change update totals
- [ ] Liver shows "To be confirmed" and is not in the estimate
- [ ] Delivery shows location field and requires it; collection hides it
- [ ] Name required; WhatsApp message opens with number 254795410514
- [ ] Call buttons dial +254795410514
- [ ] Footer year is correct; no console errors

## Install as an app (Download the App button)
The site is also an installable web app. After you publish it on Netlify (it must be on https), customers tap **Download the App** near the bottom of the page to add it to their home screen.
- Android Chrome: the button opens the install prompt.
- iPhone: Safari shows Share → Add to Home Screen (the button explains this).
This is not a Play Store or App Store app. Files: `manifest.json`, `sw.js`, and icons in `images/`.
When you change the site later, edit `CACHE = "denno-v1"` in `sw.js` to `denno-v2` (and so on) so phones pick up the update.

## Getting more people to install the app
- A red bar at the top of the page and a "Get the App" button in the menu invite visitors to install. The bar can be closed.
- Share your link on WhatsApp status and groups, put it in your WhatsApp Business profile, and print a QR code of the link on posters at the shop.
