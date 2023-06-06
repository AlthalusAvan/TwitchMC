import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../server/db/client";

const registerServer = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.body.code;
  if (!code) {
    res.send({
      error: {
        code: "CODE_MISSING",
        description: "Verification code not supplied",
      },
    });
    return;
  }

  let server = await prisma.server.findUnique({
    where: {
      verificationCode: code,
    },
  });

  if (!server) {
    res.send({
      error: {
        code: "CODE_NOT_FOUND",
        description: "Verification code invalid",
      },
    });
    return;
  }

  server = await prisma.server.update({
    where: {
      id: server.id,
    },
    data: {
      status: "linked",
    },
  });

  return res.send({
    ...server,
  });
};

export default registerServer;
