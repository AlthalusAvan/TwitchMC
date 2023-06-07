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
  const serverId = req.body.serverId;
  if (!serverId) {
    return res.send({
      access: false,
      error: "SERVER_ID_MISSING",
      description: "Please provide a valid Server ID",
    });
  }

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

  const uuid: string | undefined | null = req.body.uuid;
  if (!uuid) {
    return res.send({
      access: false,
      error: "UUID_MISSING",
      description: "Please provide a valid UUID",
    });
  }

  const mcUser = await prisma.minecraftUser.findUnique({
    where: {
      id: uuid,
    },
  });

  if (!mcUser) {
    const token = await prisma.uUIDVerificationToken.findUnique({
      where: {
        UUID: uuid,
      },
    });

    if (!token) {
      // create a new token in the database
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

  const user = await prisma.user.findUnique({
    where: {
      id: mcUser.userId,
    },
  });

  if (!user) {
    return res.send({
      access: false,
      error: "USER_NOT_FOUND",
      description:
        "There was an internal error when trying to find this user record based on this UUID",
    });

    return;
  }

  // Check if user is subscribed to the server owner on Twitch
  const serverOwner = await prisma.user.findUnique({
    where: {
      id: server.userId,
    },
  });

  if (!serverOwner) {
    return res.send({
      access: false,
      error: "SERVER_OWNER_NOT_FOUND",
      description:
        "There was an internal error when trying to find the server owner",
    });
  }

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

  if (!ownerAccount || !userAccount) {
    return res.send({
      access: false,
      error: "ACCOUNT_ERROR",
      description:
        "There was an internal error when trying to find account information",
    });
  }

  if (!userAccount.access_token || !userAccount.refresh_token) {
    return res.send({
      access: false,
      error: "TOKEN_ERROR",
      description:
        "There was an error with your account - please go to TwitchMc.io and log in again.",
    });
  }

  const valid = await fetch("https://id.twitch.tv/oauth2/validate", {
    method: "GET",
    headers: {
      Authorization: `OAuth ${userAccount.access_token}`,
    },
  });

  if (valid.status === 401) {
    // refresh token
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

    if ("error" in refreshResponse) {
      return res.send({
        access: false,
        error: "REFRESH_ERROR",
        description:
          "There was an error when trying to refresh your Twitch token",
      });
    }

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
