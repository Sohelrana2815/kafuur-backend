// import { JwtPayload } from "jsonwebtoken";

// declare global {
//   namespace Express {
//     interface Request {
//       user: JwtPayload;
//     }
//   }
// }


import { Role } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    // 1. Passport uses this interface for req.user
    interface User {
      id: string;
      email: string;
      role: Role;
    }

    // 2. Override Request.user to include the strict properties along with JwtPayload
    interface Request {
      user?: JwtPayload & {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}