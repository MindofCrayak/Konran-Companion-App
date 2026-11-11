interface Env {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI: string;
  DISCORD_GUILD_ID?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, DISCORD_GUILD_ID } = context.env;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return new Response(`Failed to exchange token: ${err}`, { status: 502 });
    }

    const tokens: any = await tokenRes.json();
    const accessToken = tokens.access_token;

    // 2. Fetch User Profile (@me)
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user: any = await userRes.json();

    // 3. Optional: Fetch Guild Member Roles if GUILD_ID is provided
    let roles: string[] = [];
    if (DISCORD_GUILD_ID) {
      const memberRes = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (memberRes.ok) {
        const memberData: any = await memberRes.json();
        roles = memberData.roles || [];
      }
    }

    // 4. Build session payload
    const sessionData = {
      id: user.id,
      username: user.username,
      global_name: user.global_name || user.username,
      avatar: user.avatar,
      roles,
    };

    // 5. Send back to the front-end with base64 session fragment
    const encodedSession = encodeURIComponent(btoa(JSON.stringify(sessionData)));
    return Response.redirect(`https://konranapp.gamemasterondemand.com/#auth=${encodedSession}`, 302);
  } catch (error: any) {
    return new Response(`Authentication error: ${error.message}`, { status: 500 });
  }
};
