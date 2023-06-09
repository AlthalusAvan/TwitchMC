import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../server/db/client";

type TwitchSubSuccess = {
  data: Array<{
    broadcaster_id: string;
    broadcaster_name: string;
    is_gift: boolean;
    tier: string;
  }>;
};

type TwitchSubFail = {
  error: string;
  status: number;
  message: string;
};

const checkAccess = async (req: NextApiRequest, res: NextApiResponse) => {
  // Check required params

  const serverId: string | undefined | null = req.body.serverId;
  if (!serverId) {
    return res.send({
      access: false,
      error: "SERVER_ID_MISSING",
      description: "Please provide a valid Server ID",
    });
  }

  const uuid: string | undefined | null = req.body.uuid;
  if (!uuid) {
    return res.send({
      access: false,
      error: "UUID_MISSING",
      description: "Please provide a valid UUID",
    });
  }

  // Get the server details
  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
    },
  });

  if (!server) {
    return res.send({
      access: false,
      error: "INVALID_SERVER",
      description: "There is no server registered with the provided ID",
    });
  }

  // Get the user details
  const user = await prisma.user.findUnique({
    where: {
      UUID: uuid,
    },
  });

  // This shouldn't happen, if it does the database has had some issues
  if (!user) {
    return res.send({
      access: false,
      error: "USER_NOT_FOUND",
      description:
        "There was an internal error when trying to find this user record based on this UUID",
    });
  }

  // If the user doesn't already exist
  if (!user.UUID) {
    // Check if there is a token in the database
    const token = await prisma.uUIDVerificationToken.findUnique({
      where: {
        UUID: uuid,
      },
    });

    // If not create a new token
    if (!token) {
      const newToken = await prisma.uUIDVerificationToken.create({
        data: {
          UUID: uuid,
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        },
      });

      return res.send({
        access: false,
        linked: false,
        code: newToken.code,
      });
    }

    return res.send({
      access: false,
      linked: false,
      code: token.code,
    });
  }

  // Check if user is subscribed to the server owner on Twitch
  const serverOwner = await prisma.user.findUnique({
    where: {
      id: server.userId,
    },
  });

  // This also shouldn't ever happen
  if (!serverOwner) {
    return res.send({
      access: false,
      error: "SERVER_OWNER_NOT_FOUND",
      description:
        "There was an internal error when trying to find the server owner",
    });
  }

  // Get the account details for the server owner and user (for Twitch API)
  const ownerAccount = await prisma.account.findUnique({
    where: {
      userId: serverOwner?.id,
    },
  });

  let userAccount = await prisma.account.findUnique({
    where: {
      userId: user.id,
    },
  });

  // This also shouldn't ever happen
  if (!ownerAccount || !userAccount) {
    return res.send({
      access: false,
      error: "ACCOUNT_ERROR",
      description:
        "There was an internal error when trying to find account information",
    });
  }

  // Another thing that should never happen
  if (!userAccount.access_token || !userAccount.refresh_token) {
    return res.send({
      access: false,
      error: "TOKEN_ERROR",
      description: `There was an error with your account - please go to ${process.env.NEXTAUTH_URL} and log in again.`,
    });
  }

  // We're required to check if OAuth tokens are valid for every request - but this means we don't have to constantly refresh the app token
  const valid = await fetch("https://id.twitch.tv/oauth2/validate", {
    method: "GET",
    headers: {
      Authorization: `OAuth ${userAccount.access_token}`,
    },
  });

  // If the token is invalid, refresh it
  if (valid.status === 401) {
    const refresh = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: userAccount.refresh_token,
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
      }),
    });

    const refreshResponse = await refresh.json();

    // If the refresh token is invalid, the user needs to re-authenticate
    if ("error" in refreshResponse) {
      return res.send({
        access: false,
        error: "REFRESH_ERROR",
        description: `There was an error when trying to refresh your Twitch token - please go to ${process.env.NEXTAUTH_URL} and log in again`,
      });
    }

    // Update the user account with the new tokens
    userAccount = await prisma.account.update({
      where: {
        id: userAccount?.id,
      },
      data: {
        access_token: refreshResponse.access_token,
        expires_at: Math.floor(Date.now() / 1000) + refreshResponse.expires_in,
        refresh_token: refreshResponse.refresh_token,
      },
    });
  }

  // Check if the user is subscribed to the server owner
  const getSubscription = await fetch(
    `https://api.twitch.tv/helix/subscriptions/user?broadcaster_id=${ownerAccount?.providerAccountId}&user_id=${userAccount?.providerAccountId}`,
    {
      method: "GET",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${userAccount?.access_token}`,
      },
    }
  );

  const subscription: TwitchSubFail | TwitchSubSuccess =
    await getSubscription.json();

  if ("error" in subscription) {
    res.send({
      access: false,
      linked: true,
    });
    return;
  }

  res.send({
    access: true,
    linked: true,
  });
  return;
};

export default checkAccess;
