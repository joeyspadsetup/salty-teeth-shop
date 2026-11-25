# Salty Teeth — Setup Guide

The site is already live (see the link Sue gave you). Right now it's showing **sample
listings** so you can see what it looks like. To make it real — so Darah can add her
own photos and prices from her phone and they show up instantly — do the two setups
below. Neither needs any coding. Takes about 15 minutes total.

---

## 1. Connect Firebase (makes the Admin page work)

Firebase is Google's free backend — it stores the product listings and photos, and
it's what lets Darah add/edit pieces from her phone without touching code.

1. Go to **console.firebase.google.com** and sign in with a Google account (yours or
   Darah's — whoever should "own" the shop's backend).
2. Click **Add project**. Name it something like `salty-teeth-shop`. You can skip
   Google Analytics (toggle it off) — not needed.
3. Once the project opens, click the **Web** icon (`</>`) to register a web app.
   Give it a nickname like "Salty Teeth site" and click **Register app**.
4. Firebase will show you a code block with a `firebaseConfig = { ... }` object.
   Copy the 6 values (apiKey, authDomain, projectId, storageBucket,
   messagingSenderId, appId).
5. Open `assets/js/firebase-config.js` in this project and paste those 6 values in,
   replacing the `REPLACE_ME` placeholders. Save the file. (Ask Sue to do this edit
   if you'd rather not touch the file yourself — just paste her the config block.)
6. In the Firebase console left sidebar: **Build → Authentication → Get started →
   Sign-in method tab → Email/Password → Enable → Save.**
7. Still in Authentication, go to the **Users** tab → **Add user**. Enter the email
   and password Darah will use to log into the admin page at `/admin.html`. This is
   her login — nobody else needs an account.
8. **Build → Firestore Database → Create database → Start in production mode** →
   pick a region near Florida (e.g. `us-east1`) → Enable.
9. In Firestore, go to the **Rules** tab, delete what's there, and paste this in,
   then click **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{productId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

10. **Build → Storage → Get started** → same region → Done. Go to the **Rules** tab,
    paste this in, and **Publish**:

    ```
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        match /products/{allPaths=**} {
          allow read: if true;
          allow write: if request.auth != null;
        }
      }
    }
    ```

That's it. Reload the live site, go to `/admin.html`, log in with the email/password
from step 7, and the real admin panel appears. The sample listings on the homepage
will disappear automatically and be replaced by whatever Darah adds.

**Firebase's free tier** easily covers a small shop like this (tens of thousands of
reads/writes and a few GB of photo storage per month, free). No credit card needed
unless the shop gets genuinely large.

---

## 2. Set Up Stripe (so "Buy Now" actually charges a card)

1. Darah creates a free account at **stripe.com** under her own name/bank details
   (she's 22, so this is hers to own — payouts land in her bank account).

   **Important — skip the "Building with an AI agent?" screen.** After signup,
   Stripe sometimes shows a setup page with a "Copy prompt" box and sandbox
   **API keys** (publishable + secret key). That's for a different kind of
   integration (a full checkout system wired into backend code) — we don't need
   it and won't use it. Click **Back** or navigate away from that screen. Never
   copy/paste the **secret key** anywhere outside Stripe's own dashboard — not
   into this site, not into a chat with Sue, not anywhere. We only ever need
   **Payment Link URLs** (below), which are safe to share since they're just
   checkout links, not credentials.

2. For each finished piece, in the Stripe Dashboard: **Payment links → + New link**.
   Enter the item name, price, and upload the same photo she's using on the site.
   Under "Collect customer information," turn on **Shipping address** so you get the
   buyer's mailing address automatically. Click **Create link**, then copy the URL
   (looks like `https://buy.stripe.com/...`).
3. Paste that URL into the **Stripe Payment Link** field on the admin page when
   adding that same piece.

Each piece gets its own payment link since every item is one-of-a-kind and priced
differently — there's no shared "cart" to manage, which keeps this simple.

---

## 3. Pointing a real domain at the site (later)

The site is currently hosted free on GitHub Pages. Whenever you buy a domain (e.g.
from Namecheap, Google Domains, etc.):

1. At your domain registrar, add a **CNAME record** pointing to
   `joeyspadsetup.github.io`.
2. In this project's root folder, create a file named `CNAME` (no extension)
   containing just your domain, e.g. `shopsaltyteeth.com`.
3. Push that file to the GitHub repo. GitHub Pages picks it up automatically
   (may take a few minutes to go live, up to 24 hours for DNS).

Ask Sue to help with this step when you're ready — it's quick.
