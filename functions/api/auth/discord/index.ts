interface Env {
  DISCORD_CLIENT_ID: string;
  DISCORD_REDIRECT_URI: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } = context.env;
  
  const scopes = ['identify', 'guilds.members.read'].join(' ');
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    DISCORD_REDIRECT_URI
  )}&scope=${encodeURIComponent(scopes)}`;

  return Response.redirect(authUrl, 302);
};
