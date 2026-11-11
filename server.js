import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '5mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'konran_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { accounts: {}, activeDiscordId: null };
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return { accounts: {}, activeDiscordId: null };
  }
}

function writeDb(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write Konran DB:', err);
  }
}

// 1. Discord OAuth2 Redirect
app.get('/api/auth/discord', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/api/auth/discord/callback`;

  if (clientId) {
    const scope = encodeURIComponent('identify');
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    return res.redirect(url);
  }

  // Fallback local dev link when DISCORD_CLIENT_ID is not yet configured in .env
  const fallbackUsername = req.query.username || 'KonranOperative#0009';
  const fallbackId = `discord_${ Buffer.from(String(fallbackUsername)).toString('hex').slice(0, 12) }`;
  const db = readDb();
  if (!db.accounts[fallbackId]) {
    db.accounts[fallbackId] = {
      account: {
        id: `acct_${fallbackId}`,
        displayName: String(fallbackUsername).split('#')[0],
        discordId: fallbackId,
        discordUsername: String(fallbackUsername),
        discordHandle: String(fallbackUsername),
        campaignName: 'Chronicles of the Konran System',
        activeCharacterId: null,
        createdAt: new Date().toISOString()
      },
      characters: []
    };
  }
  db.activeDiscordId = fallbackId;
  writeDb(db);

  const referer = req.headers.referer || 'http://localhost:3000/';
  const redirectUrl = new URL(referer);
  redirectUrl.searchParams.set('discord_id', fallbackId);
  redirectUrl.searchParams.set('discord_username', String(fallbackUsername));
  return res.redirect(redirectUrl.toString());
});

// 2. Discord OAuth2 Callback
app.get('/api/auth/discord/callback', async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/api/auth/discord/callback`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (!code || !clientId || !clientSecret) {
    return res.redirect(frontendUrl);
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Failed to exchange Discord OAuth code');
    }

    const tokenData = await tokenRes.json();
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new Error('Failed to fetch Discord user profile');
    }

    const discordUser = await userRes.json();
    const discordId = discordUser.id;
    const discordUsername = discordUser.global_name || discordUser.username;
    const discordAvatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
      : '';

    const db = readDb();
    if (!db.accounts[discordId]) {
      db.accounts[discordId] = {
        account: {
          id: `acct_${discordId}`,
          displayName: discordUsername,
          discordId,
          discordUsername,
          discordHandle: discordUser.username,
          discordAvatarUrl,
          campaignName: 'Chronicles of the Konran System',
          activeCharacterId: null,
          createdAt: new Date().toISOString()
        },
        characters: []
      };
    } else {
      db.accounts[discordId].account.discordUsername = discordUsername;
      db.accounts[discordId].account.discordAvatarUrl = discordAvatarUrl;
    }
    db.activeDiscordId = discordId;
    writeDb(db);

    const redirectUrl = new URL(frontendUrl);
    redirectUrl.searchParams.set('discord_id', discordId);
    redirectUrl.searchParams.set('discord_username', discordUsername);
    if (discordAvatarUrl) redirectUrl.searchParams.set('discord_avatar', discordAvatarUrl);
    return res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('Discord OAuth Error:', err);
    return res.redirect(frontendUrl);
  }
});

// 3. Get Current Linked Account & Characters
app.get('/api/auth/me', (req, res) => {
  const db = readDb();
  const activeId = db.activeDiscordId;
  if (!activeId || !db.accounts[activeId]) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json(db.accounts[activeId]);
});

// 4. Logout / Disconnect Discord
app.post('/api/auth/logout', (req, res) => {
  const db = readDb();
  db.activeDiscordId = null;
  writeDb(db);
  return res.json({ ok: true });
});

// 5. Sync Account & Characters (Covenants, K.A.M.P. Profiles, Lifepath, Inventory, Notes)
app.post('/api/characters/sync', (req, res) => {
  const { account, characters } = req.body;
  if (!account) {
    return res.status(400).json({ error: 'Missing account payload' });
  }
  const key = account.discordId || account.id;
  const db = readDb();
  db.accounts[key] = {
    account,
    characters: Array.isArray(characters) ? characters : [],
    updatedAt: new Date().toISOString()
  };
  if (account.discordId) {
    db.activeDiscordId = account.discordId;
  }
  writeDb(db);
  return res.json({ ok: true, syncedKey: key });
});

// Serve static production build if available
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

app.listen(PORT, () => {
  console.log(`Konra/Nyne OS & ObsydianHeart Telemetry Server running on http://localhost:${PORT}`);
});
